declare module 'formidable';

export type UploadedFields = {
  name: string
  email: string
  phone: string
  comments?: string
  service: string
  barber: string
  datetime: string
}

export type UploadedFiles = {
  file?: formidable.File // or File[] if you support multiple
}
