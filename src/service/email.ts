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
                <span style="color: #2d3748; font-size: 16px; font-weight: 600; background-color: #fed7d7; padding: 8px 12px; border-radius: 6px; display: inline-block; font-family: 'Courier New', monospace;">
                  ${temporaryPassword}
                </span>
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
              <li style="margin-bottom: 8px;">Enter your email and temporary password</li>
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