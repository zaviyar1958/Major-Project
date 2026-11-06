const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const { formatDate } = require("../utils/dateTimeFormatter.utils");
const PDFDocument = require("pdfkit");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSKEY,
  },
});

async function SendRegistrationEmail(email, username) {
  try {
    // Read the content of the HTML file
    const templatePath = path.join(
      __dirname,
      "../services",
      "registrationEmail.html"
    );
    let template = fs.readFileSync(templatePath, "utf8");

    // Replace the placeholder [Username] with the actual username
    template = template.replace("[Username]", username);
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"Bharatiyacare" <support@bharatiyacare.com>',
      to: email,
      subject: "Congratulations",
      html: template,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

const SendSubscriptionEmail = async (data) => {
  try {
    // Read the content of the HTML template
    const templatePath = path.join(
      __dirname,
      "../services",
      "subscriptionEmail.html"
    );
    let template = fs.readFileSync(templatePath, "utf8");

    // Replace placeholders with actual data
    template = template
      .replace("[Username]", data?.user?.username)
      .replace("[PlanName]", data?.plan?.name.trim())
      .replace("[PlanDuration]", data?.plan?.duration)
      .replace("[PlanPrice]", data?.plan?.price)
      .replace("[StartDate]", new Date(data?.startDate).toLocaleDateString())
      .replace("[EndDate]", new Date(data?.endDate).toLocaleDateString())
      .replace("[PaymentID]", data?.razorpayPaymentId)
      .replace("[OrderID]", data?.razorpayOrderId);

    // Send email
    const info = await transporter.sendMail({
      from: '"Bharatiyacare" <support@bharatiyacare.com>',
      to: data?.user?.email,
      subject: "Your Subscription is Confirmed!",
      html: template,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

const SendBillingEmail = async (data) => {
  try {
    // 1. Read and prepare HTML template
    const templatePath = path.join(__dirname, "../services", "billing.html");
    let template = fs.readFileSync(templatePath, "utf8");

    // Replace all placeholders
    template = template.replace(
      /\[Username\]/g,
      data?.user?.username || "Customer"
    );
    template = template.replace(/\[Email\]/g, data?.user?.email || "");
    template = template.replace(/\[Mobile\]/g, data?.user?.mobile || "");
    template = template.replace(/\[Amount\]/g, data?.amount || "0.00");
    template = template.replace(/\[Total\]/g, data?.amount-data?.discount || "0.00");
    template = template.replace(/\[Discount\]/g, data?.discount || "0.00");
    template = template.replace(/\[Tax\]/g, data?.tax || "0.00");
    template = template.replace(/\[InvoiceId\]/g, data?.invoiceId || "");
    template = template.replace(/\[OrderId\]/g, data?.orderId || "");
    template = template.replace(/\[ShipmentId\]/g, data?.shipmentId || "");
    template = template.replace(/\[issueDate\]/g, formatDate(data?.issuedDate));
    template = template.replace(/\[dueDate\]/g, formatDate(data?.dueDate));
    template = template.replace(
      /\[SalesBy\]/g,
      data?.pharmacy?.username || "MinorCare"
    );

    // Generate items table rows
    let itemsHtml = "";
    data?.medicines?.forEach((item, index) => {
      itemsHtml += `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">${index + 1}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${
            item?.medicineId?.name
          }</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${
            item?.quantity
          }</td>
          <td style="padding: 10px; border: 1px solid #ddd;">₹${
            item?.medicineId?.price
          }</td>
          <td style="padding: 10px; border: 1px solid #ddd;">₹${(
            item?.quantity * item?.medicineId?.price
          ).toFixed(2)}</td>
        </tr>
      `;
    });
    template = template.replace("[ItemsTableRows]", itemsHtml);

    // 2. Generate PDF using PDFKit
    const pdfBuffer = await new Promise((resolve) => {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // Add header
      doc
        .fillColor("#333")
        .fontSize(20)
        .text("MinorCare Invoice", { align: "center" })
        .moveDown();

      // Add invoice details
      doc
        .fontSize(12)
        .fillColor("#666")
        .text(`Invoice #: ${data?.invoiceId || "N/A"}`, { align: "right" })
        .text(`Date Issued: ${formatDate(data?.issuedDate)}`, {
          align: "right",
        })
        .text(`Due Date: ${formatDate(data?.dueDate)}`, { align: "right" })
        .moveDown();

      // Add customer details
      doc
        .fillColor("#444")
        .text(`Invoice To:`, { underline: true })
        .moveDown(0.5)
        .text(`Name: ${data?.user?.username || "Customer"}`)
        .text(`Address: Hyderabad, Telangana, 500032`)
        .text(`Mobile: +91-${data?.user?.mobile || "N/A"}`)
        .text(`Email: ${data?.user?.email || "N/A"}`)
        .moveDown();

      // Add order and shipment details
      doc
        .text(`Order ID: #${data?.orderId || "N/A"}`, { align: "right" })
        .text(`Shipment ID: #${data?.shipmentId || "N/A"}`, { align: "right" })
        .moveDown();

      // Add items table
      doc
        .fillColor("#333")
        .fontSize(14)
        .text("Items:", { underline: true })
        .moveDown(0.5);

      const items = data?.medicines || [];
      const tableTop = doc.y;
      const col1 = 50; // SL column
      const col2 = 100; // Name column
      const col3 = 350; // Qty column
      const col4 = 400; // Unit Price column
      const col5 = 500; // Total Price column

      // Table header
      doc
        .fontSize(12)
        .fillColor("#333")
        .text("SL", col1, tableTop)
        .text("Name", col2, tableTop)
        .text("Qty", col3, tableTop)
        .text("Unit Price", col4, tableTop)
        .text("Total Price", col5, tableTop)
        .moveDown();

      // Table rows
      items.forEach((item, index) => {
        const y = doc.y;
        doc
          .fillColor("#444")
          .fontSize(10)
          .text(`${index + 1}`, col1, y)
          .text(item?.medicineId?.name, col2, y)
          .text(item?.quantity, col3, y)
          .text(`₹${item?.medicineId?.price}`, col4, y)
          .text(
            `₹${(item?.quantity * item?.medicineId?.price).toFixed(2)}`,
            col5,
            y
          )
          .moveDown();
      });

      // Add totals
      doc
        .moveDown()
        .fontSize(12)
        .fillColor("#333")
        .text(`Subtotal: ₹${data?.amount || "0.00"}`, { align: "right" })
        .text(`Discount: ₹${data?.discount || "0.00"}`, { align: "right" })
        .text(`Tax: ₹${data?.tax || "0.00"}`, { align: "right" })
        .text(`Total: ₹${data?.amount || "0.00"}`, {
          align: "right",
          underline: true,
        })
        .moveDown();

      // Add thank you message
      doc
        .fontSize(14)
        .fillColor("#444")
        .text("Thank you for your purchase!", { align: "center" });

      doc.end();
    });

    // 3. Send email with PDF attachment
    const info = await transporter.sendMail({
      from: '"Bharatiyacare" <support@bharatiyacare.com>',
      to: data?.user?.email,
      subject: "Billing Information",
      html: template,
      attachments: [
        {
          filename: `invoice-${data?.invoiceId || "unknown"}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending billing email:", error);
    throw error;
  }
};

const SendForgotPasswordEmail=async(email,username,redirectUrl,otp)=>{
  try {
    // Read the content of the HTML file
    const templatePath = path.join(
      __dirname,
      "../services",
      "forgotPasswordEmail.html"
    );
    let template = fs.readFileSync(templatePath, "utf8");

    // Replace the placeholder [Username] with the actual username
    template = template.replace("[Username]", username);
    template = template.replace("[OTP]", otp);
    template=template.replace("[URL]",redirectUrl)
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"Bharatiyacare" <support@bharatiyacare.com>',
      to: email,
      subject: "Forgot Password",
      html: template,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
module.exports = {
  SendRegistrationEmail,
  SendBillingEmail,
  SendSubscriptionEmail,
  SendForgotPasswordEmail
};