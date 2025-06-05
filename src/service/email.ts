import nodemailer from 'nodemailer'

// Configure Gmail transporter
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export const sendResetPasswordEmail = async (email: string, resetCode: string) => {
  await transporter.sendMail({
    from: process.env.GMAIL_USER || 'your-email@gmail.com',
    to: email,
    subject: 'Password Reset Code',
    text: `Your password reset code is: ${resetCode}. This code will expire in 15 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Your password reset code is:</p>
        <h1 style="font-size: 32px; background-color: #f5f5f5; padding: 10px; text-align: center;">${resetCode}</h1>
        <p>This code will expire in 15 minutes.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      </div>
    `,
  })
}

export const sendOrganizationWelcomeEmail = async (
  organizationName: string,
  email: string,
  temporaryPassword: string,
  loginUrl: string = `${process.env.NEXT_PUBLIC_APP_URL}/login`
) => {
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Our Platform</title>
      <script>
        function copyToClipboard(text) {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(function() {
              const button = document.getElementById('copyBtn');
              const originalText = button.innerHTML;
              button.innerHTML = '✅ Copied!';
              button.style.background = '#10b981';
              setTimeout(function() {
                button.innerHTML = originalText;
                button.style.background = '#3b82f6';
              }, 2000);
            }).catch(function() {
              fallbackCopyTextToClipboard(text);
            });
          } else {
            fallbackCopyTextToClipboard(text);
          }
        }

        function fallbackCopyTextToClipboard(text) {
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.top = "0";
          textArea.style.left = "0";
          textArea.style.position = "fixed";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          
          try {
            const successful = document.execCommand('copy');
            const button = document.getElementById('copyBtn');
            if (successful) {
              const originalText = button.innerHTML;
              button.innerHTML = '✅ Copied!';
              button.style.background = '#10b981';
              setTimeout(function() {
                button.innerHTML = originalText;
                button.style.background = '#3b82f6';
              }, 2000);
            } else {
              button.innerHTML = '❌ Failed';
              button.style.background = '#ef4444';
              setTimeout(function() {
                button.innerHTML = '📋 Copy';
                button.style.background = '#3b82f6';
              }, 2000);
            }
          } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
          }
          
          document.body.removeChild(textArea);
        }
      </script>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
            Welcome to Our Platform
          </h1>
          <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
            Your organization account has been created successfully
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 36px; font-weight: bold;">🏢</span>
            </div>
            <h2 style="color: #2d3748; margin: 0; font-size: 24px; font-weight: 600;">
              Hello ${organizationName}!
            </h2>
          </div>

          <div style="background-color: #f7fafc; border-radius: 12px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #667eea;">
            <p style="color: #4a5568; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
              We're excited to have you on board! Your organization account has been created by our administrator. Below are your login credentials to access the platform.
            </p>
            
            <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; border: 1px solid #e2e8f0;">
              <div style="margin-bottom: 15px;">
                <label style="display: block; color: #718096; font-size: 14px; font-weight: 500; margin-bottom: 5px;">
                  Email Address:
                </label>
                <span style="color: #2d3748; font-size: 16px; font-weight: 600; background-color: #edf2f7; padding: 8px 12px; border-radius: 6px; display: inline-block;">
                  ${email}
                </span>
              </div>
              
              <div>
                <label style="display: block; color: #718096; font-size: 14px; font-weight: 500; margin-bottom: 5px;">
                  Temporary Password:
                </label>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                  <span style="color: #2d3748; font-size: 16px; font-weight: 600; background-color: #fed7d7; padding: 8px 12px; border-radius: 6px; display: inline-block; font-family: 'Courier New', monospace; user-select: all;">
                    ${temporaryPassword}
                  </span>
                  <button 
                    id="copyBtn"
                    onclick="copyToClipboard('${temporaryPassword}')" 
                    style="background: #3b82f6; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);"
                    onmouseover="this.style.background='#2563eb'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(59, 130, 246, 0.3)'"
                    onmouseout="this.style.background='#3b82f6'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(59, 130, 246, 0.2)'"
                  >
                    📋 Copy
                  </button>
                </div>
                <p style="color: #6b7280; font-size: 12px; margin: 8px 0 0 0; font-style: italic;">
                  💡 Click the copy button above to copy the password to your clipboard
                </p>
              </div>
            </div>
          </div>

          <!-- Security Notice -->
          <div style="background-color: #fff5f5; border: 1px solid #feb2b2; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <span style="color: #e53e3e; font-size: 20px; margin-right: 10px;">🔒</span>
              <h3 style="color: #c53030; margin: 0; font-size: 16px; font-weight: 600;">
                Important Security Notice
              </h3>
            </div>
            <p style="color: #742a2a; margin: 0; font-size: 14px; line-height: 1.5;">
              For security reasons, you will be required to change this temporary password during your first login. Please keep your credentials secure and never share them with unauthorized individuals.
            </p>
          </div>

          <!-- Login Instructions -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
              Getting Started
            </h3>
            <ol style="color: #4a5568; text-align: left; font-size: 15px; line-height: 1.6; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Click the login button below to access the platform</li>
              <li style="margin-bottom: 8px;">Enter your email and temporary password (use copy button for convenience)</li>
              <li style="margin-bottom: 8px;">You'll be prompted to create a new secure password</li>
              <li style="margin-bottom: 8px;">Complete your organization profile setup</li>
            </ol>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
              Login to Your Account
            </a>
          </div>

          <!-- Support Info -->
          <div style="background-color: #f0fff4; border: 1px solid #9ae6b4; border-radius: 8px; padding: 20px; text-align: center;">
            <h4 style="color: #276749; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
              Need Help?
            </h4>
            <p style="color: #2f855a; margin: 0; font-size: 14px; line-height: 1.5;">
              If you have any questions or need assistance, please don't hesitate to contact our support team at 
              <a href="mailto:${process.env.SUPPORT_EMAIL || process.env.GMAIL_USER}" style="color: #276749; font-weight: 600; text-decoration: none;">
                ${process.env.SUPPORT_EMAIL || process.env.GMAIL_USER}
              </a>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #2d3748; padding: 25px 30px; text-align: center;">
          <p style="color: #a0aec0; margin: 0; font-size: 14px;">
            This email was sent to ${email}
          </p>
          <p style="color: #718096; margin: 10px 0 0 0; font-size: 12px;">
            © ${new Date().getFullYear()} Your Company Name. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Welcome to Our Platform!

    Hello ${organizationName},

    Your organization account has been created successfully. Here are your login credentials:

    Email: ${email}
    Temporary Password: ${temporaryPassword}

    IMPORTANT: For security reasons, you will be required to change this temporary password during your first login.

    Getting Started:
    1. Visit: ${loginUrl}
    2. Enter your email and temporary password
    3. You'll be prompted to create a new secure password
    4. Complete your organization profile setup

    If you need any assistance, please contact our support team at ${process.env.SUPPORT_EMAIL || process.env.GMAIL_USER}

    Best regards,
    Your Platform Team
  `;

  await transporter.sendMail({
    from: `"Platform Team" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `Welcome ${organizationName} - Your Account Credentials`,
    text: textContent,
    html: emailHtml,
  });
};

// Add this interface for type safety
interface RifAssignmentEmailParams {
  to: string
  internalUserName: string
  vendorName: string
  assignedBy: string
  dueDate: string
  secureToken: string
  comments?: string
  rifUrl: string
}

// Add this new function
export const sendRifAssignmentEmail = async (params: RifAssignmentEmailParams) => {
  const {
    to,
    internalUserName,
    vendorName,
    assignedBy,
    dueDate,
    secureToken,
    comments,
    rifUrl
  } = params

  const formattedDueDate = new Date(dueDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>RIF Assessment Assignment</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
            📋 RIF Assessment Assignment
          </h1>
          <p style="color: #bfdbfe; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
            Risk Intake Form requires your completion
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 36px; font-weight: bold;">⚡</span>
            </div>
            <h2 style="color: #2d3748; margin: 0; font-size: 24px; font-weight: 600;">
              Hello ${internalUserName}!
            </h2>
          </div>

          <!-- Assignment Details -->
          <div style="background-color: #f0f9ff; border-radius: 12px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #3b82f6;">
            <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
              You have been assigned to complete a <strong>Risk Intake Form (RIF)</strong> assessment for the following vendor:
            </p>
            
            <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
              <div style="display: grid; gap: 15px;">
                <div>
                  <label style="display: block; color: #6b7280; font-size: 14px; font-weight: 500; margin-bottom: 5px;">
                    Vendor Name:
                  </label>
                  <span style="color: #1f2937; font-size: 18px; font-weight: 600;">
                    ${vendorName}
                  </span>
                </div>
                
                <div>
                  <label style="display: block; color: #6b7280; font-size: 14px; font-weight: 500; margin-bottom: 5px;">
                    Assigned By:
                  </label>
                  <span style="color: #1f2937; font-size: 16px; font-weight: 500;">
                    ${assignedBy}
                  </span>
                </div>
                
                <div>
                  <label style="display: block; color: #6b7280; font-size: 14px; font-weight: 500; margin-bottom: 5px;">
                    Due Date:
                  </label>
                  <span style="color: #dc2626; font-size: 16px; font-weight: 600; background-color: #fef2f2; padding: 4px 8px; border-radius: 4px;">
                    ${formattedDueDate}
                  </span>
                </div>
              </div>
            </div>

            ${comments ? `
            <div style="background-color: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px;">
              <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">
                💬 Assignment Comments:
              </h4>
              <p style="color: #451a03; margin: 0; font-size: 14px; line-height: 1.5; font-style: italic;">
                "${comments}"
              </p>
            </div>
            ` : ''}
          </div>

          <!-- What's Already Done -->
          <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <span style="color: #16a34a; font-size: 20px; margin-right: 10px;">✅</span>
              <h3 style="color: #15803d; margin: 0; font-size: 16px; font-weight: 600;">
                What's Already Completed
              </h3>
            </div>
            <p style="color: #166534; margin: 0; font-size: 14px; line-height: 1.5;">
              <strong>Section 1: Third Party Information</strong> has already been completed by the client admin. You'll need to review this section and complete the remaining sections (2-7) of the risk assessment.
            </p>
          </div>

          <!-- Instructions -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
              📝 What You Need To Do
            </h3>
            <ol style="color: #4a5568; font-size: 15px; line-height: 1.6; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Click the secure link below to access the RIF form</li>
              <li style="margin-bottom: 8px;">Review Section 1 (Third Party Information) - already filled</li>
              <li style="margin-bottom: 8px;">Complete Sections 2-7 with accurate information</li>
              <li style="margin-bottom: 8px;">Submit the form before the due date</li>
              <li style="margin-bottom: 8px;">Risk assessment will be automatically calculated</li>
            </ol>
          </div>

          <!-- Security Notice -->
          <div style="background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <span style="color: #dc2626; font-size: 20px; margin-right: 10px;">🔒</span>
              <h3 style="color: #991b1b; margin: 0; font-size: 16px; font-weight: 600;">
                Security Notice
              </h3>
            </div>
            <p style="color: #7f1d1d; margin: 0; font-size: 14px; line-height: 1.5;">
              This is a secure, time-limited link that expires in <strong>48 hours</strong>. Do not share this link with anyone. If you experience any issues accessing the form, please contact the assigning admin immediately.
            </p>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${rifUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); transition: all 0.3s ease;">
              🚀 Complete RIF Assessment
            </a>
            <p style="color: #6b7280; margin: 15px 0 0 0; font-size: 12px;">
              Link expires: ${new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleString()}
            </p>
          </div>

          <!-- Support Info -->
          <div style="background-color: #f9fafb; border: 1px solid #d1d5db; border-radius: 8px; padding: 20px; text-align: center;">
            <h4 style="color: #374151; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
              Need Help?
            </h4>
            <p style="color: #4b5563; margin: 0; font-size: 14px; line-height: 1.5;">
              If you have questions about the assessment or technical issues, contact:<br>
              <strong>Admin:</strong> ${assignedBy}<br>
              <strong>Support:</strong> 
              <a href="mailto:${process.env.SUPPORT_EMAIL || process.env.GMAIL_USER}" style="color: #3b82f6; font-weight: 600; text-decoration: none;">
                ${process.env.SUPPORT_EMAIL || process.env.GMAIL_USER}
              </a>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #2d3748; padding: 25px 30px; text-align: center;">
          <p style="color: #a0aec0; margin: 0; font-size: 14px;">
            This email was sent to ${to}
          </p>
          <p style="color: #718096; margin: 10px 0 0 0; font-size: 12px;">
            © ${new Date().getFullYear()} Risk Management Platform. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    RIF Assessment Assignment

    Hello ${internalUserName},

    You have been assigned to complete a Risk Intake Form (RIF) assessment for:

    Vendor: ${vendorName}
    Assigned By: ${assignedBy}
    Due Date: ${formattedDueDate}
    ${comments ? `Comments: ${comments}` : ''}

    Section 1 (Third Party Information) has already been completed. You need to complete sections 2-7.

    Complete the assessment here: ${rifUrl}

    IMPORTANT: This secure link expires in 48 hours.

    If you need assistance, contact ${assignedBy} or ${process.env.SUPPORT_EMAIL || process.env.GMAIL_USER}

    Best regards,
    Risk Management Team
  `;

  await transporter.sendMail({
    from: `"Risk Management Team" <${process.env.GMAIL_USER}>`,
    to: to,
    subject: `🔔 RIF Assessment Assignment - ${vendorName} (Due: ${formattedDueDate})`,
    text: textContent,
    html: emailHtml,
  });
};

// ...existing code...

// Add this interface
interface RifReviewNotificationParams {
  to: string
  clientName: string
  vendorName: string
  submittedBy: string
  submittedAt: string
  riskLevel: string
  reviewUrl: string
  submissionId: string
}

// Add this new function
export const sendRifReviewNotificationEmail = async (params: RifReviewNotificationParams) => {
  const {
    to,
    clientName,
    vendorName,
    submittedBy,
    submittedAt,
    riskLevel,
    reviewUrl,
    submissionId
  } = params

  const formattedSubmissionDate = new Date(submittedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  // Risk level styling
  const getRiskLevelStyle = (level: string) => {
    switch (level) {
      case 'HIGH':
        return { 
          color: '#dc2626', 
          backgroundColor: '#fef2f2', 
          borderColor: '#fca5a5',
          icon: '🔴'
        }
      case 'MEDIUM':
        return { 
          color: '#d97706', 
          backgroundColor: '#fffbeb', 
          borderColor: '#fbbf24',
          icon: '🟡'
        }
      case 'LOW':
        return { 
          color: '#16a34a', 
          backgroundColor: '#f0fdf4', 
          borderColor: '#86efac',
          icon: '🟢'
        }
      default:
        return { 
          color: '#6b7280', 
          backgroundColor: '#f9fafb', 
          borderColor: '#d1d5db',
          icon: '⚪'
        }
    }
  }

  const riskStyle = getRiskLevelStyle(riskLevel)

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>RIF Assessment - Ready for Review</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
            ✅ RIF Assessment Complete
          </h1>
          <p style="color: #a7f3d0; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
            Ready for your review and approval
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #059669 0%, #047857 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 36px; font-weight: bold;">📋</span>
            </div>
            <h2 style="color: #2d3748; margin: 0; font-size: 24px; font-weight: 600;">
              Hello ${clientName}!
            </h2>
          </div>

          <!-- Submission Summary -->
          <div style="background-color: #f0fdf4; border-radius: 12px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #059669;">
            <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
              Great news! The Risk Intake Form (RIF) assessment that you initiated has been completed and is now ready for your review.
            </p>
            
            <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
              <div style="display: grid; gap: 15px;">
                <div>
                  <label style="display: block; color: #6b7280; font-size: 14px; font-weight: 500; margin-bottom: 5px;">
                    Vendor Name:
                  </label>
                  <span style="color: #1f2937; font-size: 18px; font-weight: 600;">
                    ${vendorName}
                  </span>
                </div>
                
                <div>
                  <label style="display: block; color: #6b7280; font-size: 14px; font-weight: 500; margin-bottom: 5px;">
                    Completed By:
                  </label>
                  <span style="color: #1f2937; font-size: 16px; font-weight: 500;">
                    ${submittedBy}
                  </span>
                </div>
                
                <div>
                  <label style="display: block; color: #6b7280; font-size: 14px; font-weight: 500; margin-bottom: 5px;">
                    Submitted On:
                  </label>
                  <span style="color: #1f2937; font-size: 16px; font-weight: 500;">
                    ${formattedSubmissionDate}
                  </span>
                </div>

                <div>
                  <label style="display: block; color: #6b7280; font-size: 14px; font-weight: 500; margin-bottom: 5px;">
                    Risk Assessment:
                  </label>
                  <span style="color: ${riskStyle.color}; font-size: 16px; font-weight: 600; background-color: ${riskStyle.backgroundColor}; padding: 6px 12px; border-radius: 6px; border: 1px solid ${riskStyle.borderColor}; display: inline-block;">
                    ${riskStyle.icon} ${riskLevel} RISK
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Required -->
          <div style="background-color: #eff6ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <span style="color: #2563eb; font-size: 20px; margin-right: 10px;">⏰</span>
              <h3 style="color: #1d4ed8; margin: 0; font-size: 16px; font-weight: 600;">
                Action Required
              </h3>
            </div>
            <p style="color: #1e40af; margin: 0; font-size: 14px; line-height: 1.5;">
              Please review the completed assessment and either <strong>approve</strong> or <strong>reject</strong> it. You can also add comments and request revisions if needed.
            </p>
          </div>

          <!-- Next Steps -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
              📝 What You Can Do
            </h3>
            <ul style="color: #4a5568; font-size: 15px; line-height: 1.6; padding-left: 20px;">
              <li style="margin-bottom: 8px;"><strong>Review:</strong> Examine all sections and risk assessment results</li>
              <li style="margin-bottom: 8px;"><strong>Approve:</strong> Accept the assessment if everything looks good</li>
              <li style="margin-bottom: 8px;"><strong>Reject:</strong> Send back for revisions with specific feedback</li>
              <li style="margin-bottom: 8px;"><strong>Comment:</strong> Add notes or questions for the submitter</li>
              <li style="margin-bottom: 8px;"><strong>Export:</strong> Download the assessment for your records</li>
            </ul>
          </div>

          ${riskLevel === 'HIGH' ? `
          <!-- High Risk Warning -->
          <div style="background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <span style="color: #dc2626; font-size: 20px; margin-right: 10px;">⚠️</span>
              <h3 style="color: #991b1b; margin: 0; font-size: 16px; font-weight: 600;">
                High Risk Assessment Detected
              </h3>
            </div>
            <p style="color: #7f1d1d; margin: 0; font-size: 14px; line-height: 1.5;">
              This vendor assessment has been flagged as <strong>HIGH RISK</strong>. Please review carefully and consider additional due diligence measures before approval.
            </p>
          </div>
          ` : ''}

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${reviewUrl}" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4); transition: all 0.3s ease;">
              🔍 Review Assessment
            </a>
            <p style="color: #6b7280; margin: 15px 0 0 0; font-size: 12px;">
              Submission ID: ${submissionId}
            </p>
          </div>

          <!-- Support Info -->
          <div style="background-color: #f9fafb; border: 1px solid #d1d5db; border-radius: 8px; padding: 20px; text-align: center;">
            <h4 style="color: #374151; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
              Need Help?
            </h4>
            <p style="color: #4b5563; margin: 0; font-size: 14px; line-height: 1.5;">
              If you have questions about the assessment or need technical support:<br>
              <strong>Support:</strong> 
              <a href="mailto:${process.env.SUPPORT_EMAIL || process.env.GMAIL_USER}" style="color: #059669; font-weight: 600; text-decoration: none;">
                ${process.env.SUPPORT_EMAIL || process.env.GMAIL_USER}
              </a>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #2d3748; padding: 25px 30px; text-align: center;">
          <p style="color: #a0aec0; margin: 0; font-size: 14px;">
            This email was sent to ${to}
          </p>
          <p style="color: #718096; margin: 10px 0 0 0; font-size: 12px;">
            © ${new Date().getFullYear()} Risk Management Platform. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    RIF Assessment Complete - Ready for Review

    Hello ${clientName},

    The Risk Intake Form (RIF) assessment you initiated has been completed and is ready for your review.

    Assessment Details:
    - Vendor: ${vendorName}
    - Completed By: ${submittedBy}
    - Submitted: ${formattedSubmissionDate}
    - Risk Level: ${riskLevel}
    - Submission ID: ${submissionId}

    ${riskLevel === 'HIGH' ? '⚠️ WARNING: This assessment has been flagged as HIGH RISK. Please review carefully.' : ''}

    Please review and approve/reject the assessment: ${reviewUrl}

    You can:
    - Review all assessment sections
    - Approve or reject the submission
    - Add comments or request revisions
    - Export the assessment for your records

    If you need assistance, contact: ${process.env.SUPPORT_EMAIL || process.env.GMAIL_USER}

    Best regards,
    Risk Management Team
  `;

  await transporter.sendMail({
    from: `"Risk Management Team" <${process.env.GMAIL_USER}>`,
    to: to,
    subject: `🔔 RIF Assessment Complete - ${vendorName} [${riskLevel} Risk] - Review Required`,
    text: textContent,
    html: emailHtml,
  });
};


interface VendorQuestionnaireInvitationParams {
  to: string
  vendorName: string
  clientName: string
  riskLevel: string
  templateName: string
  dueDate: string
  registrationUrl: string
}

// Add this new function
export const sendVendorQuestionnaireInvitation = async (params: VendorQuestionnaireInvitationParams) => {
  const {
    to,
    vendorName,
    clientName,
    riskLevel,
    templateName,
    dueDate,
    registrationUrl
  } = params

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: `🔐 Security Questionnaire Required - ${riskLevel} Risk Assessment`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Security Questionnaire Invitation</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .risk-badge { 
            display: inline-block; 
            padding: 8px 16px; 
            border-radius: 20px; 
            font-weight: bold; 
            font-size: 12px;
            ${riskLevel === 'HIGH' ? 'background-color: #fee2e2; color: #dc2626;' : 
              riskLevel === 'MEDIUM' ? 'background-color: #fef3c7; color: #d97706;' : 
              'background-color: #dcfce7; color: #16a34a;'}
          }
          .cta-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            font-weight: bold;
            margin: 20px 0;
          }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
          .info-box { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛡️ Security Questionnaire</h1>
            <p>Third-Party Risk Assessment Required</p>
          </div>
          
          <div class="content">
            <h2>Hello ${vendorName || 'Vendor'},</h2>
            
            <p>You have been invited by <strong>${clientName}</strong> to complete a security questionnaire as part of their vendor onboarding process.</p>
            
            <div class="info-box">
              <h3>📋 Assessment Details:</h3>
              <ul>
                <li><strong>Risk Level:</strong> <span class="risk-badge">${riskLevel}</span></li>
                <li><strong>Questionnaire:</strong> ${templateName}</li>
                <li><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</li>
                <li><strong>Client:</strong> ${clientName}</li>
              </ul>
            </div>
            
            <h3>📝 What You Need to Do:</h3>
            <ol>
              <li><strong>Click the button below</strong> to access the registration portal</li>
              <li><strong>Complete your vendor profile</strong> with company information</li>
              <li><strong>Answer the security questionnaire</strong> based on your ${riskLevel.toLowerCase()} risk level</li>
              <li><strong>Upload any required evidence</strong> or documentation</li>
              <li><strong>Submit for review</strong> by ${clientName}</li>
            </ol>
            
            <div style="text-align: center;">
              <a href="${registrationUrl}" class="cta-button">
                🚀 Complete Registration & Questionnaire
              </a>
            </div>
            
            <div class="info-box">
              <h4>⏰ Important Notes:</h4>
              <ul>
                <li>This invitation expires on <strong>${new Date(dueDate).toLocaleDateString()}</strong></li>
                <li>You can save your progress and return later</li>
                <li>All information is encrypted and secure</li>
                <li>Contact ${clientName} if you have questions</li>
              </ul>
            </div>
            
            <p><strong>Questions?</strong> Reply to this email or contact ${clientName} directly.</p>
            
            <p>Best regards,<br>
            <strong>${clientName}</strong><br>
            Third-Party Risk Management Team</p>
          </div>
          
          <div class="footer">
            <p>🔐 This is an automated security assessment invitation from G3 Cyberspace TPRM Platform</p>
            <p>If you received this email by mistake, please ignore it.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Vendor questionnaire invitation sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Failed to send vendor questionnaire invitation:', error)
    throw error
  }
}