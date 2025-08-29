import { Button, Form, Input } from "antd";
import { useEffect, useState } from "react";
import { TbLockPassword } from "react-icons/tb";
import { useHistory } from "react-router-dom";
import { AxiosWithLoading, ErrorPrinter, RemoveLocalStorageOnLogout } from "../../constants/Common";
import { APIHelper } from "../../constants/APIHelper";

const ChangePassword = () => {
  const [oldPasswordVisible, setOldPasswordVisible] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [form] = Form.useForm();
  const history = useHistory();

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
        APIHelper.postConfig("/account/changeAccountPassword", {
          OldPassword: values.old,
          NewPassword: values.new,
          NewConfimPassword: values.confirm,
        })
      )
      if (response.status === 200) {
        RemoveLocalStorageOnLogout();
        history.push('/')
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
        initialValues={{ old: '', new: '', confirm: '' }}
        onFinish={onFinish}
        className={"login-form"}
        layout="vertical"
      >
        <Form.Item
          name="old"
          rules={[{ required: true, message: "Please enter your password" }]}
          style={{ marginBottom: 0 }}
        >
          <div className={"login-field"}>
            <TbLockPassword className={"login-icon"} />
            <Input.Password
              className={"login-input"}
              placeholder="Old password"
              autoComplete="current-password"
              visibilityToggle={{
                visible: oldPasswordVisible,
                onVisibleChange: setOldPasswordVisible
              }}
            />
          </div>
        </Form.Item>

        <Form.Item
          name="new"
          rules={[{ required: true, message: "Please enter your password" }]}
          style={{ marginBottom: 0 }}
        >
          <div className={"login-field"}>
            <TbLockPassword className={"login-icon"} />
            <Input.Password
              className={"login-input"}
              placeholder="New password"
              autoComplete="current-password"
              visibilityToggle={{
                visible: newPasswordVisible,
                onVisibleChange: setNewPasswordVisible
              }}
            />
          </div>
        </Form.Item>

        <Form.Item
          name="confirm"
          rules={[{ required: true, message: "Please enter your password" }]}
          style={{ marginBottom: 0 }}
        >
          <div className={"login-field"}>
            <TbLockPassword className={"login-icon"} />
            <Input.Password
              className={"login-input"}
              placeholder="Confirm password"
              autoComplete="current-password"
              visibilityToggle={{
                visible: confirmPasswordVisible,
                onVisibleChange: setConfirmPasswordVisible
              }}
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
 
export default ChangePassword;