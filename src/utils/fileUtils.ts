
export const validateFile = (file: File, allowedTypes: string[], maxSize: number) => {
  const errors: string[] = [];
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not supported. Please use ${allowedTypes.join(', ')}`);
  }
  
  if (file.size > maxSize) {
    errors.push(`File size exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit`);
  }
  
  return errors;
};

export const extractTextFromFile = async (file: File): Promise<string> => {
  // This is a placeholder for actual text extraction
  // In a real implementation, you'd use libraries like pdf-parse, mammoth, etc.
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (file.type === 'text/plain') {
        resolve(reader.result as string);
      } else {
        resolve(`[Extracted text from ${file.name}]\n\nThis is a placeholder for the actual extracted text content from the ${file.type} file.`);
      }
    };
    reader.readAsText(file);
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
