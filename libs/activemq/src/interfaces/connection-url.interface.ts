export interface ConnectionURL {
  host: string;
  password: string;
  port: number;
  transport: 'tls' | 'ssl' | 'tcp';
  username: string;
}
