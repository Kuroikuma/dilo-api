// src/firebase/firebase.service.ts
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService {
  private storage: admin.storage.Storage;

  constructor(private configService: ConfigService) {
    const serviceAccount = JSON.parse(
      this.configService.get<string>('FB_SERVICE_ACCOUNT')
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: this.configService.get<string>('FB_STORAGE_BUCKET'),
    });

    this.storage = admin.storage();
  }

  async uploadImageFromUrl(url: string, destinationPath: string): Promise<string> {
    const bucket = this.storage.bucket();
    const file = bucket.file(destinationPath);
    
    // Descargar la imagen desde la URL de DALL·E
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    
    // Subir a Firebase Storage
    await file.save(Buffer.from(buffer), {
      metadata: { contentType: 'image/png' },
    });
    
    // Hacer pública la imagen y obtener la URL
    await file.makePublic();
    return `https://storage.googleapis.com/${bucket.name}/${file.name}`;
  }
}