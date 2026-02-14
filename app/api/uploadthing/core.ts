import { createUploadthing, type FileRouter } from "uploadthing/next"
 
const f = createUploadthing()
 
export const ourFileRouter = {
  propertyImages: f({ image: { maxFileSize: "2MB", maxFileCount: 10 } })
    .middleware(async () => {
      // TODO: Add auth check when implementing
      return { userId: "temp-user-id" }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId)
      console.log("file url", file.ufsUrl)
 
      return { uploadedBy: metadata.userId, url: file.ufsUrl }
    }),
  imageUploader: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async () => {
      return { userId: "temp-user-id" }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Avatar upload complete for userId:", metadata.userId)
      console.log("file url", file.ufsUrl)
 
      return { uploadedBy: metadata.userId, url: file.ufsUrl }
    }),
} satisfies FileRouter
 
export type OurFileRouter = typeof ourFileRouter
