
import React from 'react';

interface JobTitleInputProps {
  jobTitle: string;
  setJobTitle: (title: string) => void;
}

const JobTitleInput: React.FC<JobTitleInputProps> = ({ jobTitle, setJobTitle }) => {
  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-4">Job Title</h3>
      <input
        type="text"
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
        placeholder="e.g., Senior Software Engineer (auto-extracted from job description)"
        className="w-full px-3 py-2 border border-apple-core/30 dark:border-citrus/30 rounded-md focus:outline-none focus:ring-2 focus:ring-apricot focus:border-transparent bg-white dark:bg-blueberry/10 text-blueberry dark:text-apple-core"
      />
      <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mt-2">
        Job title will be automatically extracted from the job description if not provided.
      </p>
    </div>
  );
};

export default JobTitleInput;
