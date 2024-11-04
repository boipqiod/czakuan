import {RandomUtil} from '@/lib/RandomUtil';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

export class S3 {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly bucketRegion: string;

  constructor() {
    this.bucketName = process.env.AWS_BUCKET_NAME ?? '';
    this.bucketRegion = process.env.AWS_BUCKET_REGION ?? '';

    this.s3Client = new S3Client({
      region: process.env.AWS_REGION as string,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    });
  }

  // 이미지 임시 업로드
  async uploadTempImage(prifix: string, file: File): Promise<string> {
    const key = `tmp/${prifix}/${RandomUtil.getUniqueString()}.jpg`;

    //TODO: 파일 관련해서 제대로 되는지 다시 한번 확인 필요
    const uploadCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.stream(),
      ContentType: file.type,
    });

    try {
      await this.s3Client.send(uploadCommand);
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

    // 기존 파일, 이동할 위치로 복사
    const copyCommand = new CopyObjectCommand({
      Bucket: this.bucketName,
      CopySource: originSource,
      Key: `${targetKeyPrefix}/${key}.jpg`,
      ContentType: 'image/jpeg',
    });
    await this.s3Client.send(copyCommand);

    // 기존 파일 삭제
    const deleteCommand = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: originSource,
    });
    await this.s3Client.send(deleteCommand);

    return this.getFileUrl(this.bucketName, `${targetKeyPrefix}/${key}.jpg`);
  }

  private getFileUrl(bucketName: string, key: string): string {
    return `https://${bucketName}.s3.${this.bucketRegion}.amazonaws.com/${key}`;
  }
}

export default new S3();
