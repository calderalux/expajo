# Email Service Configuration

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Email Service Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Email Provider Setup

### Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password as `SMTP_PASS`

3. **Configuration**:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   ```

### Other Email Providers

#### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Yahoo Mail
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

#### Custom SMTP Server
```bash
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASS=your-password
```

## Testing Email Service

### 1. Test Email Configuration
```bash
curl "http://localhost:3000/api/admin/email/test?email=test@example.com"
```

### 2. Test OTP Email
```bash
curl -X POST "http://localhost:3000/api/admin/email/test" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "code": "123456"}'
```

### 3. Test Admin Login Flow
1. Go to `/admin/login`
2. Enter your admin email
3. Check console for OTP code (if email not configured)
4. Or check your email inbox (if email is configured)

## Email Templates

The system includes professional email templates with:

- **Branded Design**: Uses Expajo colors and fonts
- **Security Information**: Clear expiry and attempt limits
- **Responsive Layout**: Works on all devices
- **Security Warnings**: Alerts for suspicious activity

## Development vs Production

### Development Mode
- If email is not configured, OTP codes are logged to console
- No actual emails are sent
- Perfect for testing and development

### Production Mode
- Configure SMTP settings
- Real emails are sent to admin users
- Professional templates with branding
- Security features enabled

## Troubleshooting

### Common Issues

1. **"Email service not configured"**
   - Check environment variables are set
   - Verify SMTP credentials are correct

2. **"Authentication failed"**
   - Use app password instead of regular password
   - Enable 2FA on your email account

3. **"Connection timeout"**
   - Check SMTP host and port
   - Verify firewall settings

4. **"Invalid credentials"**
   - Double-check username and password
   - Ensure app password is used for Gmail

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG_EMAIL=true
```

This will log detailed SMTP connection information.

## Security Considerations

1. **App Passwords**: Use app-specific passwords, not main account passwords
2. **Environment Variables**: Never commit email credentials to version control
3. **Rate Limiting**: Email service includes built-in rate limiting
4. **OTP Expiry**: Codes expire in 10 minutes for security
5. **Attempt Limits**: Maximum 3 attempts per OTP code

## Monitoring

### Email Delivery Tracking
- All email sends are logged
- Failed deliveries are tracked
- Success rates can be monitored

### Performance Metrics
- Email send time
- Delivery success rate
- Template rendering time

## Future Enhancements

1. **Email Analytics**: Track open rates and clicks
2. **Template Management**: Admin interface for email templates
3. **Multiple Providers**: Support for multiple email services
4. **Queue System**: Background email processing
5. **Delivery Reports**: Detailed delivery status tracking
