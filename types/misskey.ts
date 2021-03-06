export interface DriveFile {
  animation?: boolean
  comment?: string
  id: string
  createdAt: string
  name: string
  type: string
  md5: string
  datasize: number
  folderId?: string
  isSensitive: boolean
  thumbnailUrl?: string
  url?: string
  userId: string
  webpublicUrl: string
  isSelecting?: boolean
}

export interface DriveFolder {
  id: string
  createdAt: string
  name: string
  foldersCount: number
  filesCount: number
  parentId?: string
  parent?: DriveFolder
}
