import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PATHS } from '../../routes/routes';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { fetchTerms, setGlobalTerms } from '../../api/terms';
import { updateMembership } from '../../api/packages';

// Custom styles for Quill editor
const quillStyles = `
  .ql-editor {
    min-height: 300px;
    font-size: 14px;
    line-height: 1.6;
  }
  .ql-toolbar {
    border-top: 1px solid #e5e7eb;
    border-left: 1px solid #e5e7eb;
    border-right: 1px solid #e5e7eb;
    border-bottom: none;
    background-color: #f9fafb;
  }
  .ql-container {
    border-bottom: 1px solid #e5e7eb;
    border-left: 1px solid #e5e7eb;
    border-right: 1px solid #e5e7eb;
    border-top: none;
  }
  .ql-toolbar button {
    color: #374151;
  }
  .ql-toolbar button:hover {
    color: #1f2937;
  }
  .ql-toolbar button.ql-active {
    color: #3b82f6;
  }
  .ql-toolbar .ql-stroke {
    stroke: currentColor;
  }
  .ql-toolbar .ql-fill {
    fill: currentColor;
  }
  .ql-toolbar .ql-picker {
    color: #374151;
  }
  .ql-toolbar .ql-picker-options {
    background-color: white;
    border: 1px solid #e5e7eb;
  }
`;

const TermsManager = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const drawId = searchParams.get('drawId');
  const membershipId = searchParams.get('membershipId');
  const mode = searchParams.get('mode'); // 'draft' to edit draft copy during create-draw or create-package
  const context = searchParams.get('context'); // 'membership' or 'draw'

  const isDraftMode = useMemo(() => mode === 'draft' && !drawId && !membershipId, [mode, drawId, membershipId]);
  const draftKey = useMemo(() => (context === 'membership' ? 'terms:membership:draft' : 'terms:draft'), [context]);

  // Quill editor configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'blockquote', 'code-block'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'align',
    'link', 'blockquote', 'code-block'
  ];

  useEffect(() => {
    // Load content by context
    (async () => {
      if (drawId) {
        const { data } = await fetchTerms(drawId);
        setContent(data?.html || '');
        return;
      }
      if (membershipId) {
        const { data } = await fetchTerms(undefined, membershipId);
        setContent(data?.html || '');
        return;
      }
      if (isDraftMode) {
        const draft = localStorage.getItem(draftKey);
        if (draft && draft.length > 0) {
          setContent(draft);
          return;
        }
        const { data } = await fetchTerms();
        setContent(data?.html || '');
        return;
      }
      const { data } = await fetchTerms();
      setContent(data?.html || '');
    })();
  }, [drawId, membershipId, isDraftMode, draftKey]);

  const handleSave = async () => {
    if (drawId) {
      // Per-draw editing is handled in the Draw edit/create forms via draft, not directly here
      setIsEditing(false);
      return;
    }

    if (membershipId) {
      // Update membership terms directly via API
      try {
        await updateMembership(membershipId, { termsHtml: content } as any);
        setIsEditing(false);
        // navigate back to edit package page
        navigate(PATHS.EDIT_PACKAGE.replace(':packageId', membershipId));
      } catch (_) {
        setIsEditing(false);
      }
      return;
    }

    if (isDraftMode) {
      // Save draft to localStorage; Create pages will read it
      localStorage.setItem(draftKey, content);
      localStorage.setItem(`${draftKey}Edited`, '1');
      setIsEditing(false);
      // Decide route by context
      if (context === 'membership') {
        navigate(PATHS.CREATE_PACKAGE + `?termsDraftSaved=1`);
      } else {
        navigate(PATHS.CREATE_DRAW + `?termsDraftSaved=1`);
      }
      return;
    }

    // Save global original terms (persist to backend settings via secured route)
    setGlobalTerms(content).finally(() => setIsEditing(false));
  };

  return (
    <div className="flex items-center justify-center">
      <style>{quillStyles}</style>
      <div className="w-full max-w-4xl left-0 shadow-xl py-8 px-5 rounded-2xl border border-border/30 bg-white">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">{drawId ? 'Custom Terms & Conditions (this draw only)' : membershipId ? 'Custom Terms & Conditions (this package only)' : isDraftMode ? (context === 'membership' ? 'Terms & Conditions (copy for new package)' : 'Terms & Conditions (copy for new draw)') : 'Default Terms & Conditions'}</h1>
          {!isEditing && (
            <button className="btn btn-sm" onClick={() => setIsEditing(true)}>Edit</button>
          )}
        </div>
        <div className="mt-4">
          {isEditing ? (
            <div className="border rounded-lg">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                placeholder="Enter your terms and conditions here..."
                style={{ minHeight: '300px' }}
              />
            </div>
          ) : (
            <div 
              className="prose text-left max-w-none p-4 border rounded-lg bg-gray-50 min-h-[300px]"
              dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-500">No terms defined yet.</p>' }}
            />
          )}
        </div>
        <div className="mt-4 flex gap-2">
          {isEditing ? (
            <>
              <button className="btn btn-primary" onClick={handleSave}>Save</button>
              <button className="btn" onClick={() => setIsEditing(false)}>Cancel</button>
            </>
          ) : (
            <>
              <button className="btn" onClick={() => setIsEditing(true)}>Edit</button>
              {drawId && (
                <button className="btn btn-outline" onClick={() => navigate(PATHS.CREATE_DRAW)}>Back to Create Draw</button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TermsManager;


