# Troubleshooting Guide

This guide helps you troubleshoot common issues with the Starknet Lightning Mixer application.

## 🚀 Quick Fixes

### Common Issues and Solutions

#### 1. Build/Installation Issues

**Problem**: `npm install` fails with dependency conflicts

```bash
Error: npm ERR! peer dep missing
```

**Solution**:
```bash
# Use legacy peer deps flag
npm install --legacy-peer-deps

# Or clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

**Problem**: TypeScript compilation errors

```bash
Error: Cannot find module '@/components/Button'
```

**Solution**:
1. Check `tsconfig.json` paths configuration
2. Verify file exists at correct location
3. Restart development server

#### 2. Development Server Issues

**Problem**: Development server won't start

```bash
Error: Port 3000 is in use
```

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

**Problem**: Page shows 404 errors

**Solution**:
1. Verify page exists in `src/app/` directory
2. Check file name matches route (case-sensitive)
3. Restart development server

#### 3. Wallet Connection Issues

**Problem**: Wallet connection fails

```bash
Error: No wallet available
```

**Solution**:
1. Install Starknet wallet (Argent, Braavos)
2. Ensure wallet browser extension is enabled
3. Check if you're on correct network (testnet/mainnet)
4. Refresh page and try again

**Problem**: Transaction signing fails

**Solution**:
1. Check wallet is unlocked
2. Verify sufficient funds for gas fees
3. Ensure correct network is selected
4. Try refreshing wallet connection

#### 4. API Issues

**Problem**: API requests fail with CORS errors

**Solution**:
1. Check API server is running on correct port
2. Verify CORS configuration in backend
3. Ensure correct API URL in environment variables

**Problem**: API responses are slow or timeout

**Solution**:
1. Check network connectivity
2. Verify external services (Lightning, Cashu) are operational
3. Check server performance and logs
4. Consider increasing timeout values

## 🔍 Debugging Techniques

### 1. Browser Developer Tools

**Console Errors**:
```javascript
// Check browser console for errors
// Open Developer Tools (F12) → Console tab
```

**Network Issues**:
```javascript
// Check Network tab for failed requests
// Look for 4xx/5xx status codes
// Verify request/response payloads
```

**Performance Issues**:
```javascript
// Use Performance tab to identify bottlenecks
// Check Memory usage
// Analyze CPU profiles
```

### 2. Node.js Debugging

**Server Logs**:
```bash
# Check server logs
npm run dev

# Enable debug logging
DEBUG=* npm run dev
```

**Database Issues**:
```bash
# Check database connection
# Verify database file exists
# Check database permissions
```

### 3. Smart Contract Debugging

**Transaction Issues**:
```bash
# Check transaction on Starkscan
# Verify contract address
# Check transaction status
```

**Contract Interaction**:
```bash
# Use Starknet CLI for testing
# Verify function calls and parameters
# Check event logs
```

## 🐛 Error Codes and Solutions

### Frontend Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| `WALLET_NOT_CONNECTED` | No wallet connected | Install and connect Starknet wallet |
| `INSUFFICIENT_FUNDS` | Insufficient balance | Add more funds to wallet |
| `INVALID_AMOUNT` | Invalid amount specified | Use amount between min/max limits |
| `INVALID_ADDRESS` | Invalid wallet address | Verify address format and network |
| `NETWORK_ERROR` | Network connectivity issue | Check internet connection |
| `TRANSACTION_FAILED` | Transaction failed | Check gas fees and retry |

### Backend Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| `DATABASE_CONNECTION_FAILED` | Database connection failed | Check database file and permissions |
| `EXTERNAL_SERVICE_ERROR` | External service error | Check Lightning/Cashu service status |
| `VALIDATION_ERROR` | Input validation failed | Check request parameters |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait and retry later |
| `INTERNAL_ERROR` | Internal server error | Check server logs and contact support |

### Smart Contract Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| `INSUFFICIENT_BALANCE` | Insufficient contract balance | Check contract balance |
| `UNAUTHORIZED` | Unauthorized access | Verify caller permissions |
| `CONTRACT_PAUSED` | Contract is paused | Wait for unpause or contact support |
| `TIMELOCK_ACTIVE` | Time-lock still active | Wait for time-lock to expire |
| `INVALID_SIGNATURE` | Invalid signature | Verify signature parameters |

## 🛠️ Performance Issues

### Frontend Performance

**Problem**: Slow page load times

**Diagnostics**:
```javascript
// Check Network tab for slow resources
// Analyze bundle size with webpack-bundle-analyzer
// Use Lighthouse for performance audit
```

**Solutions**:
1. Optimize images and assets
2. Implement code splitting
3. Use lazy loading for components
4. Enable caching headers
5. Minimize JavaScript bundle size

**Problem**: Memory leaks

**Diagnostics**:
```javascript
// Check Memory tab in DevTools
// Look for increasing memory usage
// Analyze heap snapshots
```

**Solutions**:
1. Clean up event listeners
2. Use useEffect cleanup functions
3. Avoid memory leaks in closures
4. Implement proper state management

### Backend Performance

**Problem**: Slow API responses

**Diagnostics**:
```bash
# Check server logs
# Monitor CPU and memory usage
# Analyze database queries
# Check external service response times
```

**Solutions**:
1. Implement caching strategies
2. Optimize database queries
3. Use connection pooling
4. Implement rate limiting
5. Add load balancing

## 🔧 Configuration Issues

### Environment Variables

**Problem**: Missing environment variables

**Solution**:
```bash
# Create .env.local file
# Copy variables from .env.example
# Verify all required variables are set
```

**Problem**: Incorrect API URLs

**Solution**:
```bash
# Verify API URLs in .env.local
# Check network accessibility
# Test API endpoints manually
```

### Database Issues

**Problem**: Database connection failed

**Solution**:
```bash
# Check database file permissions
# Verify database file exists
# Check disk space
# Restart database service
```

**Problem**: Database locked

**Solution**:
```bash
# Check for other processes using database
# Restart application
# Clear database locks
```

## 📱 Mobile Issues

### iOS Safari

**Problem**: Touch events not working

**Solution**:
```css
/* Add touch-action CSS */
.touchable {
  touch-action: manipulation;
}
```

**Problem**: Keyboard covers input fields

**Solution**:
```css
/* Add viewport meta tag */
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### Android Chrome

**Problem: Slow performance

**Solution**:
1. Enable hardware acceleration
2. Optimize images for mobile
3. Reduce JavaScript bundle size
4. Use appropriate caching

## 🌐 Network Issues

### Proxy/Firewall

**Problem**: Requests blocked by firewall

**Solution**:
1. Check firewall rules
2. Verify proxy configuration
3. Use appropriate ports
4. Check SSL/TLS configuration

### DNS Issues

**Problem**: DNS resolution failures

**Solution**:
```bash
# Check DNS resolution
nslookup starknet.io

# Flush DNS cache
ipconfig /flushclean  # Windows
sudo dscacheutil -flushcache  # macOS
```

## 🧪 Testing Issues

### Unit Tests

**Problem**: Tests fail with import errors

**Solution**:
1. Check Jest configuration
2. Verify module path mapping
3. Update test environment setup
4. Check for missing dependencies

### E2E Tests

**Problem**: E2E tests fail intermittently

**Solution**:
1. Add proper wait conditions
2. Use explicit selectors
3. Handle async operations
4. Stabilize test environment

## 📊 Monitoring and Logging

### Application Logs

**Problem**: No logs generated

**Solution**:
```javascript
// Check logging configuration
// Verify log file permissions
// Ensure log directory exists
// Check log levels
```

### Error Tracking

**Problem**: Errors not tracked

**Solution**:
1. Implement error reporting
2. Use monitoring tools
3. Set up alerting
4. Create error dashboards

## 🆘 Getting Help

### Support Channels

1. **GitHub Issues**: [Create an issue](https://github.com/lawrencezcl/starknet-lightning-mixer/issues)
2. **Discord Community**: Join our Discord server
3. **Email Support**: support@starknetlightning.mixer
4. **Documentation**: Check these docs and API documentation

### Creating Bug Reports

When creating bug reports, include:

1. **Environment Information**
   - Operating system
   - Browser version
   - Node.js version
   - Application version

2. **Steps to Reproduce**
   - Clear steps to reproduce the issue
   - Expected vs actual behavior
   - Error messages or screenshots

3. **Additional Context**
   - Recent changes
   - Related configuration
   - Network conditions

### Code Examples

Include relevant code snippets:

```typescript
// Example of code causing issue
const createMix = async (params) => {
  // Code that's causing problem
};
```

## 📚 Additional Resources

- [API Documentation](./api.md)
- [Architecture Guide](./architecture.md)
- [Security Guidelines](./security.md)
- [Deployment Guide](./deployment.md)

---

*Last updated: January 2024*