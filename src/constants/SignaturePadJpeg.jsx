import { Button, Modal, Space, Typography } from "antd";
import { useRef } from "react";
import SignaturePad from "react-signature-canvas";

const { Text } = Typography;

const SignaturePadJpeg = ({
  visible,
  setVisible,
  onSubmit,
  width = 300,
  height = 150,
  label = "Please sign below",
  modalTitle = "Signature",
}) => {
  const sigPadRef = useRef(null);

  const handleClose = () => setVisible(false);
  const handleClear = () => sigPadRef.current?.clear();

  const handleSubmit = () => {
    if (sigPadRef.current?.isEmpty()) return;

    const canvas = sigPadRef.current.getCanvas();
    const ctx = canvas.getContext("2d");

    // Fill background with white to avoid black image issue
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg");
    const base64Data = dataUrl.split(",")[1];

    if (onSubmit) onSubmit(base64Data);
    handleClose();
    handleClear();
  };

  return (
    <Modal
      title={modalTitle}
      open={visible}
      onCancel={handleClose}
      footer={null}
      centered
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Text>{label}</Text>
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: 4,
            overflow: "hidden",
            width,
            height,
          }}
        >
          <SignaturePad
            ref={sigPadRef}
            canvasProps={{ width, height, className: "signatureCanvas" }}
          />
        </div>
        <Space>
          <Button onClick={handleClear}>Clear</Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            style={{ background: "#377188", borderColor: "#377188" }}
          >
            Submit
          </Button>
        </Space>
      </Space>
    </Modal>
  );
};

export default SignaturePadJpeg;
