import React, { useState } from "react";
import { Input, Button, Typography, Space, message, Card } from "antd";
import { useBrowserPrint } from "../../hooks/useBrowserPrint";
const { TextArea } = Input;
const { Title, Text } = Typography;

export default function ManualBarcodePrinting() {

  const [serialText, setSerialText] = useState("");
  const { selectedPrinter, print } = useBrowserPrint();
  // -------------------------
  // Your PRN template here
  // -------------------------
  const prnTemplate = `
^XA
^FO50,50^BCN,100,Y,N,N
^FDserialNo1^FS

^FO50,200^BCN,100,Y,N,N
^FDserialNo2^FS

^FO50,350^BCN,100,Y,N,N
^FDserialNo3^FS

^FO50,500^BCN,100,Y,N,N
^FDserialNo4^FS
^XZ
`;

  // -------------------------
  // Split into groups of 4
  // -------------------------
  function chunkSerials(serials, size = 4) {
    const chunks = [];

    for (let i = 0; i < serials.length; i += size) {
      chunks.push(serials.slice(i, i + size));
    }

    return chunks;
  }

  // -------------------------
  // Replace serialNo1-4
  // -------------------------
  function generateLabel(template, group) {
    return template
      .replace(/serialNo1/g, group[0] ?? "")
      .replace(/serialNo2/g, group[1] ?? "")
      .replace(/serialNo3/g, group[2] ?? "")
      .replace(/serialNo4/g, group[3] ?? "");
  }

  // -------------------------
  // Print Handler
  // -------------------------
  const handlePrint = () => {

    const serials = serialText
      .split(/\n|\t/)
      .map(s => s.trim())
      .filter(Boolean);

    if (serials.length === 0) {
      message.error("Please enter serial numbers");
      return;
    }

    if (!selectedPrinter) {
      message.error("No printer selected");
      return;
    }

    const groups = chunkSerials(serials, 4);

    let finalLabel = "";

    groups.forEach(group => {
      const label = generateLabel(prnTemplate, group);
      finalLabel += label + "\n";
    });

    console.log("Final Label:", finalLabel);

    print(finalLabel);

    message.success(`Sent ${groups.length} label(s) to printer`);
  };

  // -------------------------
  // Count serial numbers
  // -------------------------
  const serialCount = serialText
    .split(/\n|\t/)
    .map(s => s.trim())
    .filter(Boolean).length;

  const labelCount = Math.ceil(serialCount / 4);

  return (
    <Card style={{ maxWidth: 600, margin: "40px auto" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>

        <Title level={3}>Barcode Label Printer</Title>

        <Text>
          Enter serial numbers (one per line). Each label prints 4 barcodes.
        </Text>

        <TextArea
          rows={12}
          placeholder={`Example:
12345
67890
11111
22222`}
          value={serialText}
          onChange={(e) => setSerialText(e.target.value)}
        />

        <Text type="secondary">
          Serial Numbers: {serialCount} | Labels: {labelCount}
        </Text>

        <Button
          type="primary"
          size="large"
          block
          onClick={handlePrint}
        >
          Print Labels
        </Button>

      </Space>
    </Card>
  );
}