import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

export const QuillEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);
  const quillInstance = useRef(null);

  useEffect(() => {
    if (editorRef.current && !quillInstance.current) {
      quillInstance.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: placeholder || 'Type something...',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'clean']
          ]
        }
      });
      quillInstance.current.on('text-change', () => {
        onChange(quillInstance.current.root.innerHTML);
      });
      if (value) {
        quillInstance.current.root.innerHTML = value;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (quillInstance.current && value !== quillInstance.current.root.innerHTML) {
      if (!value || value === '<p><br></p>') {
        quillInstance.current.root.innerHTML = '';
      }
    }
  }, [value]);

  return <div ref={editorRef} />;
};

QuillEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};
