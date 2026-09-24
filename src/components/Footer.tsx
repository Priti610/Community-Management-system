import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <div>FixMyCity civic issue management</div>
        <div className="flex items-center space-x-1.5 text-slate-500 font-medium">
          <span>Built for more responsive neighborhoods</span>
          <span className="text-[#1E66F5]">✨</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
