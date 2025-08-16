// src/environments/environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api/v1', // Dev environment
  aws: {
    region: 'ap-southeast-1', // Your AWS region
    s3: {
      bucketName: 'your-profile-pictures-bucket',
      region: 'ap-southeast-1'
    }
  }
};