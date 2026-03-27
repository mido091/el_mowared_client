import { ref } from 'vue';

export function useFileUpload(accept = 'image/*', maxSizeMB = 5) {
  const file       = ref(null);
  const preview    = ref(null);
  const error      = ref(null);
  const isDragging = ref(false);

  const validate = (f) => {
    if (!f) return 'No file selected';
    if (f.size > maxSizeMB * 1024 * 1024) return `File must be under ${maxSizeMB}MB`;
    return null;
  };

  const handleFile = (f) => {
    error.value = validate(f);
    if (error.value) { file.value = null; preview.value = null; return; }
    file.value = f;
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => { preview.value = e.target.result; };
      reader.readAsDataURL(f);
    }
  };

  const onInputChange = (e) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const onDrop = (e) => {
    isDragging.value = false;
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const clear = () => {
    file.value    = null;
    preview.value = null;
    error.value   = null;
  };

  return { file, preview, error, isDragging, onInputChange, onDrop, clear };
}
