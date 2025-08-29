
import { Button, Form, Image, Input, notification } from "antd";
import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { TbLockPassword } from "react-icons/tb";
import { useHistory } from "react-router-dom";
import { LocalStorage } from "../../constants/Storage";
import { AxiosWithLoading, ErrorPrinter, SpinLoading } from "../../constants/Common";
import { APIHelper } from "../../constants/APIHelper";

export default function LoginPage() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [form] = Form.useForm();
  const history = useHistory()

  useEffect(() => {
    // Only run if window is defined (client-side)
    if (localStorage.getItem(LocalStorage.ACCESS_TOKEN)) {
      history.push('/')
    }

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
      const apikey = await AxiosWithLoading({
        ...APIHelper.getConfig("/encrypt/publicKey"),
        baseURL: import.meta.env.VITE_LMS_API_URL
      })
      localStorage.setItem(LocalStorage.PUBLIC_KEY, apikey.data.key);

      const response = await AxiosWithLoading({
        ...APIHelper.postConfig("/auth/obtainAccessToken", {
          UserName: values.username,
          Password: values.password
        }),
        baseURL: import.meta.env.VITE_LMS_API_URL
      })
      if (response.data.branches.length > 0) {
        localStorage.setItem(LocalStorage.ACCESS_TOKEN, response.data.token);
        localStorage.setItem(
          LocalStorage.MODULE_GRANT,
          JSON.stringify(response.data.branches)
        );
        if (response.status === 200 && response.data.isFirstTime) {
          localStorage.setItem(LocalStorage.FIRST_TIME_LOGIN, 1);
          history.push("/change-password");
        }
        history.push("/");
      } else {
        notification.error({
          message: "Error",
          description:
            "No branches are assigned for this user. Login blocked.",
          placement: "bottomRight"
        })
      }
    } catch (error) {
      ErrorPrinter(error);
    }
  };

  return (
    <>
      <div className={"login-container"}>
        <div className={"login-logo"}>
          <Image
            src="/images/leedennox.png"
            alt="Profile"
            width={windowSize.width * 0.8}
            height={windowSize.height * 0.13}
          />
        </div>
        <Form
          form={form}
          initialValues={{ name: "", password: "" }}
          onFinish={onFinish}
          className={"login-form"}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please enter your username" }]}
            style={{ marginBottom: 0 }}
          >
            <div className={"login-field"}>
              <FaUser className={"login-icon"} />
              <Input
                className={"login-input"}
                placeholder="Username"
                autoComplete="username"
              />
            </div>
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
            style={{ marginBottom: 0 }}
          >
            <div className={"login-field"}>
              <TbLockPassword className={"login-icon"} />
              <Input.Password
                className={"login-input"}
                placeholder="Password"
                autoComplete="current-password"
                visibilityToggle={{
                  visible: passwordVisible,
                  onVisibleChange: setPasswordVisible
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
              Login
            </Button>
          </Form.Item>

          <div className={"forgot-password"}>
            Forgotten Password?&nbsp;&nbsp;
            <span
              onClick={() => {
                history.push("/forgot-password");
              }}
              style={{ textDecoration: "underline", cursor: "pointer" }}
            >
              Click Here
            </span>
          </div>
        </Form>
        <SpinLoading />
      </div>
    </>
  );
}
