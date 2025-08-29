import { Alert, Button, Form, Input, notification } from "antd";
import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import { AxiosWithLoading, ErrorPrinter } from "../../constants/Common";
import { APIHelper } from "../../constants/APIHelper";

const ForgotPassword = () => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [form] = Form.useForm();
  const history = useHistory()

  useEffect(() => {
    // Only run if window is defined (client-side)
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };

      window.addEventListener("resize", handleResize);
      handleResize(); // Set initial size

      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const onFinish = async (values) => {
    try {
      const response = await AxiosWithLoading(
        APIHelper.getConfig(
          "/account/forgottenAccountPassword?employeeno=" + values.employeeNo
        )
      );
      if (response.status === 200) {
        notification.success({
          message: 'Success',
          description: 'Email sent successfully. Please check your inbox.',
          placement: 'bottomRight'
        })
        history.push("/");
      }
    } catch (error) {
      ErrorPrinter(error);
    }
  }

  return ( 
    <div className={"login-container"}>
      <div className={"login-logo"}>
        <Image
          src="/leedennox.png"
          alt="Profile"
          width={windowSize.width * 0.8}
          height={windowSize.height * 0.13}
        />
      </div>
      <h2 className={"menu-title"}>
        Forgot Password
      </h2>
      <Form
        form={form}
        initialValues={{ employeeNo: '' }}
        onFinish={onFinish}
        className={"login-form"}
        layout="vertical"
      >
        <Form.Item
          name="employeeNo"
          rules={[{ required: true, message: "Please enter your Employee No" }]}
          style={{ marginBottom: 0 }}
        >
          <div className={"login-field"}>
            <FaUser className={"login-icon"} />
            <Input
              className={"login-input"}
              placeholder="Employee No"
              autoComplete="employeeNo"
            />
          </div>
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            className={"login-btn"}
            block
          >
            Send
          </Button>
        </Form.Item>
      </Form>
      <SpinLoading />
    </div> 
  );
}
 
export default ForgotPassword;