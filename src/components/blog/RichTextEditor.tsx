import { useCallback, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      [{ 'align': [] }],
      ['clean']
    ],
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'blockquote', 'code-block',
    'link', 'image', 'align'
  ];

  const handleChange = useCallback((content: string) => {
    onChange(content);
  }, [onChange]);

  return (
    <div className={`bg-background border border-border rounded-md ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="text-foreground"
        style={{
          backgroundColor: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          borderRadius: 'var(--radius)'
        }}
      />
      <style>{`
        .ql-toolbar {
          border-top: 1px solid hsl(var(--border));
          border-left: 1px solid hsl(var(--border));
          border-right: 1px solid hsl(var(--border));
          background: hsl(var(--muted));
          border-radius: var(--radius) var(--radius) 0 0;
        }
        .ql-container {
          border-bottom: 1px solid hsl(var(--border));
          border-left: 1px solid hsl(var(--border));
          border-right: 1px solid hsl(var(--border));
          background: hsl(var(--background));
          border-radius: 0 0 var(--radius) var(--radius);
          color: hsl(var(--foreground));
        }
        .ql-editor {
          color: hsl(var(--foreground));
          min-height: 200px;
        }
        .ql-editor::before {
          color: hsl(var(--muted-foreground));
        }
        .ql-picker-label, .ql-picker-item {
          color: hsl(var(--foreground));
        }
        .ql-stroke {
          stroke: hsl(var(--foreground));
        }
        .ql-fill {
          fill: hsl(var(--foreground));
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;