# Deployment Guide

This comprehensive guide covers various deployment options for the Starknet Lightning Mixer application.

## 🚀 Quick Deploy Options

### 1. Vercel (Recommended)

Vercel is the recommended platform for deploying Next.js applications.

#### Prerequisites
- Vercel account
- GitHub repository
- Environment variables configured

#### Deployment Steps

1. **Connect GitHub Repository**
   - Log in to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the `starknet-lightning-mixer` repository

2. **Configure Build Settings**
   ```json
   {
     "framework": "nextjs",
     "buildCommand": "npm install --legacy-peer-deps && npm run build",
     "installCommand": "npm install --legacy-peer-deps"
   }
   ```

3. **Environment Variables**
   Add these environment variables in Vercel:
   ```env
   NEXT_PUBLIC_STARKNET_NETWORK=testnet
   NEXT_PUBLIC_STARKNET_RPC_URL=https://testnet.starknet.io
   LIGHTNING_API_URL=https://api.lightning.network
   CASHU_MINT_URL=https://mint.cashu.space
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be available at `https://your-app.vercel.app`

#### Automatic Deployments

Enable automatic deployments for:
- Main branch pushes → Production
- Pull requests → Preview deployments

### 2. Docker Deployment

#### Prerequisites
- Docker installed
- Docker Hub account (optional)

#### Building Docker Image

1. **Create Dockerfile**
   ```dockerfile
   # Multi-stage build
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm install --legacy-peer-deps
   COPY . .
   RUN npm run build

   # Production stage
   FROM node:18-alpine AS runner
   WORKDIR /app
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next ./.next
   COPY --from=builder /app/node_modules ./node_modules
   COPY --from=builder /app/package.json ./package.json

   EXPOSE 3000
   ENV PORT 3000
   CMD ["npm", "start"]
   ```

2. **Build Image**
   ```bash
   docker build -t starknet-lightning-mixer .
   ```

3. **Run Container**
   ```bash
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_STARKNET_NETWORK=testnet \
     -e NEXT_PUBLIC_STARKNET_RPC_URL=https://testnet.starknet.io \
     starknet-lightning-mixer
   ```

#### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_STARKNET_NETWORK=testnet
      - NEXT_PUBLIC_STARKNET_RPC_URL=https://testnet.starknet.io
      - LIGHTNING_API_URL=https://api.lightning.network
      - CASHU_MINT_URL=https://mint.cashu.space
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

### 3. Manual Deployment

#### Prerequisites
- Server with Node.js 18+
- PM2 process manager
- Nginx (recommended)

#### Deployment Steps

1. **Clone Repository**
   ```bash
   git clone https://github.com/lawrencezcl/starknet-lightning-mixer.git
   cd starknet-lightning-mixer
   ```

2. **Install Dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Build Application**
   ```bash
   npm run build
   ```

4. **Setup PM2**
   ```bash
   npm install -g pm2
   ```

5. **Create PM2 Configuration**
   Create `ecosystem.config.js`:
   ```javascript
   module.exports = {
     apps: [{
       name: 'starknet-lightning-mixer',
       script: 'npm',
       args: 'start',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       },
       error_file: './logs/err.log',
       out_file: './logs/out.log',
       log_file: './logs/combined.log',
       time: true
     }]
   };
   ```

6. **Start Application**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

7. **Configure Nginx**
   Create `/etc/nginx/sites-available/starknet-lightning-mixer`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/starknet-lightning-mixer /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### 4. Railway Deployment

#### Prerequisites
- Railway account
- GitHub repository

#### Deployment Steps

1. **Connect GitHub to Railway**
   - Log in to [Railway](https://railway.app)
   - Click "New Project"
   - Deploy from GitHub repo

2. **Configure Service**
   - Select the repository
   - Set build command: `npm install --legacy-peer-deps && npm run build`
   - Set start command: `npm start`
   - Set port: 3000

3. **Add Environment Variables**
   Add the same environment variables as mentioned in Vercel deployment

4. **Deploy**
   - Click "Deploy"
   - Railway will build and deploy your application

### 5. Netlify Deployment

#### Prerequisites
- Netlify account
- GitHub repository

#### Deployment Steps

1. **Create Netlify Site**
   - Log in to [Netlify](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

2. **Build Settings**
   - Build command: `npm install --legacy-peer-deps && npm run build`
   - Publish directory: `.next`
   - Node version: 18

3. **Environment Variables**
   Add environment variables in Netlify dashboard

4. **Deploy**
   - Click "Deploy site"

## 🔧 Configuration Management

### Environment Variables

Create `.env.local` for development:
```env
# Starknet Configuration
NEXT_PUBLIC_STARKNET_NETWORK=testnet
NEXT_PUBLIC_STARKNET_RPC_URL=https://testnet.starknet.io

# Lightning Network Configuration
LIGHTNING_API_URL=https://api.lightning.network
LIGHTNING_API_KEY=your_lightning_api_key

# Cashu Configuration
CASHU_MINT_URL=https://mint.cashu.space

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3003
NODE_ENV=development
```

### Production Environment Variables

```env
# Starknet Configuration
NEXT_PUBLIC_STARKNET_NETWORK=mainnet
NEXT_PUBLIC_STARKNET_RPC_URL=https://mainnet.starknet.io

# Lightning Network Configuration
LIGHTNING_API_URL=https://api.lightning.network
LIGHTNING_API_KEY=your_production_lightning_api_key

# Cashu Configuration
CASHU_MINT_URL=https://mint.cashu.space

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# Security
JWT_SECRET=your_jwt_secret
API_KEY=your_api_key
```

## 🔒 Security Considerations

### 1. HTTPS Configuration

Always use HTTPS in production:
- Configure SSL certificates
- Redirect HTTP to HTTPS
- Use secure headers

### 2. Environment Variable Security

- Never commit sensitive data to version control
- Use strong, unique secrets
- Rotate keys regularly
- Use secret management services

### 3. Network Security

- Configure firewall rules
- Use VPN or private networks for backend services
- Implement rate limiting
- Monitor for suspicious activity

### 4. Application Security

- Keep dependencies updated
- Regular security audits
- Input validation
- Output sanitization

## 📊 Monitoring and Logging

### 1. Application Monitoring

Set up monitoring for:
- Performance metrics
- Error rates
- User activity
- Resource usage

### 2. Logging

Implement structured logging:
```javascript
// Example logging configuration
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.File({ filename: 'error.log', level: 'error' })
  ]
});
```

### 3. Health Checks

Implement health endpoints:
```javascript
// server/routes/health.js
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version
  });
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci --legacy-peer-deps

    - name: Run tests
      run: npm test

    - name: Build application
      run: npm run build

    - name: Deploy to Vercel
      uses: vercel/action@v1
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (requires 18+)
   - Use `--legacy-peer-deps` flag
   - Verify environment variables

2. **Deployment Failures**
   - Check build logs
   - Verify environment variables
   - Ensure all dependencies are installed

3. **Runtime Errors**
   - Check application logs
   - Verify API endpoints
   - Check database connections

### Debug Mode

Enable debug mode for detailed logging:
```bash
DEBUG=* npm run dev
```

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Docker Documentation](https://docs.docker.com)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs)

---

*Last updated: January 2024*