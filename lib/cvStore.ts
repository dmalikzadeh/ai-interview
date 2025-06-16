let cvFile: File | null = null;

export function setTempCV(file: File | null) {
  cvFile = file;
}

export function getTempCV() {
  return cvFile;
}