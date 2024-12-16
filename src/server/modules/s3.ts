import {getUniqueString} from '@/lib/random';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {Upload} from '@aws-sdk/lib-storage';

export class S3 {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly bucketRegion: string;

  constructor() {
    this.bucketName = process.env.IMAGE_BUCKET_NAME ?? '';
    this.bucketRegion = process.env.IMAGE_BUCKET_REGION ?? '';

    this.s3Client = new S3Client({
      region: process.env.AWS_REGION as string,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    });
  }

  async uploadImage(prefix: string, key: string, file: File): Promise<string> {
    const uploadCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: `${prefix}/${key}.jpg`,
      Body: file.stream(),
      ContentType: 'image/jpeg',
    });

    try {
      await this.s3Client.send(uploadCommand);
      return this.getFileUrl(this.bucketName, `${prefix}/${key}.jpg`);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // 이미지 임시 업로드
  async uploadTempImage(prefix: string, file: File): Promise<string> {
    const key = `tmp/${prefix}/${getUniqueString()}.jpg`;

    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: file.type,
      },
    });

    try {
      await upload.done();
      return this.getFileUrl(this.bucketName, key);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async moveObject(
    originSource: string,
    targetKeyPrefix: string,
    key: string,
  ): Promise<string> {
    console.log('### 파일 이동', {originSource, targetKeyPrefix, key});

    // Extract the key from the full URL
    const originKey = originSource.replace(
      `https://${this.bucketName}.s3.${this.bucketRegion}.amazonaws.com/`,
      '',
    );

    try {
      // 기존 파일, 이동할 위치로 복사
      const copyCommand = new CopyObjectCommand({
        Bucket: this.bucketName,
        CopySource: `${this.bucketName}/${originKey}`,
        Key: `${targetKeyPrefix}/${key}.jpg`,
        ContentType: 'image/jpeg',
      });
      await this.s3Client.send(copyCommand);

      // 기존 파일 삭제
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: originKey,
      });
      await this.s3Client.send(deleteCommand);

      return this.getFileUrl(this.bucketName, `${targetKeyPrefix}/${key}.jpg`);
    } catch (error) {
      console.error('Error moving file:', error);
      throw error;
    }
  }

  protected getFileUrl(bucketName: string, key: string): string {
    console.log('### getFileUrl', {
      bucketName,
      key,
      bucketRegion: this.bucketRegion,
    });

    return `https://${bucketName}.s3.${this.bucketRegion}.amazonaws.com/${key}`;
  }
}

export default new S3();
