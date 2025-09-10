import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchTerms } from '../../api/terms';

const TermsViewer = () => {
  const [searchParams] = useSearchParams();
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    const drawId = searchParams.get('drawId') || undefined;
    const membershipId = searchParams.get('membershipId') || undefined;
    (async () => {
      const { data } = await fetchTerms(drawId, membershipId);
      setHtml(data?.html || '');
    })();
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-3xl text-left shadow-xl py-8 px-5 rounded-2xl border border-border/30 bg-white">
        {/* <h1 className="text-lg font-semibold">Terms & Conditions</h1> */}
        <div className="mt-4 prose max-w-none" dangerouslySetInnerHTML={{ __html: html || '<p>No terms available.</p>' }} />
      </div>
    </div>
  );
};

export default TermsViewer;


