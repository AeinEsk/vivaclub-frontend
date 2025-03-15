// Update any input fields in OTP component
<input
    type="text"
    placeholder="Enter OTP"
    className="appearance-none block w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
    required
    maxLength={6}
    value={otp}
    onChange={(e) => handleOtpChange(e)}
    disabled={loading}
/> 