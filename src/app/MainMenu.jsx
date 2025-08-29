import { Card, Layout, Modal, Table, DatePicker } from "antd";
import _ from "lodash";
import { useEffect, useState } from "react";
import { GoBellFill } from "react-icons/go";
import { IoIosLogOut } from "react-icons/io";
import { IoSettings } from "react-icons/io5";
import { LuSquareArrowRight } from "react-icons/lu";
import { SlArrowRight } from "react-icons/sl";
import { Route, Switch, useHistory, useLocation } from "react-router-dom";
import { APIHelper } from "../constants/APIHelper";
import { AxiosWithLoading, ErrorPrinter, getUsernamefromToken, RemoveLocalStorageOnLogout, SpinLoading, switchBranch } from "../constants/Common";
import { PathLink } from "../constants/PathLink";
import { LocalStorage, SessionStorage } from "../constants/Storage";
import LoginPage from "./login/page";
import { PullToRefresh } from "antd-mobile";
import dayjs from "dayjs";
const { Content } = Layout;
const { RangePicker } = DatePicker;

const MainMenu = () => {
  const location = useLocation();
  const [menu, setMenu] = useState([]);
  const [openSetting, setOpenSetting] = useState(false);
  const [openNotification, setOpenNotification] = useState(false);
  const [notificationData, setNotificationData] = useState([])
  const [dateRange, setDateRange] = useState([null, null])
  const [branchList, setBranchList] = useState([]);
  const [refresh, setRefresh] = useState(false)
  const history = useHistory()

  const getCurrenctBranchInfo = async () => {
    try {
      if (!sessionStorage.getItem(SessionStorage.BRANCH_CODE)) {
        let branches = JSON.parse(
          localStorage.getItem(LocalStorage.MODULE_GRANT)
        );
        let defBranch = _.find(branches, (o) => o.IsDefault) || branches[0];
        sessionStorage.setItem(SessionStorage.MODULE_API, defBranch.LMSURI);
        sessionStorage.setItem(
          SessionStorage.MODULE_VIEWER_API,
          defBranch.LMSViewerURI || ""
        );
        sessionStorage.setItem(
          SessionStorage.BRANCH_CODE,
          defBranch.DivisionBranchCode
        );
        sessionStorage.setItem(
          SessionStorage.DIVISION_BRANCH_NAME,
          defBranch.DivisionBranchName
        );
        sessionStorage.setItem(
          SessionStorage.DEFAULT_CURRENCY_CODE,
          defBranch.DefaultCurrencyCode
        );
      }
      const response = await AxiosWithLoading({
        ...APIHelper.getConfig("/account/getuseraccessmobilefunc"),
        baseURL: import.meta.env.VITE_LMS_API_URL
      });
      setMenu(response.data.userAccessNextScanList);
      setBranchList(
        _.groupBy(
          JSON.parse(localStorage.getItem(LocalStorage.MODULE_GRANT)),
          "Country"
        )
      );
    } catch (error) {
      ErrorPrinter(error);
      RemoveLocalStorageOnLogout();
    }
  };

  const getMobileNotification = async () => {
    try{
      let body = {
        StartDate: '2025-07-15',
        EndDate: '2025-08-29'
      }
      const response = await AxiosWithLoading({
        ...APIHelper.postConfig('/account/getMobileNotifications', body)
      })
      console.log('data: ', response.data.Table)
      setNotificationData(response.data.Table)
    } catch (error) {
      ErrorPrinter(error);
    }
  }

  useEffect(() => {
    if (!refresh) {
      if (!localStorage.getItem(LocalStorage.ACCESS_TOKEN)) {
        window.location.href = '/login'
      } else {
        getCurrenctBranchInfo();
      }
    }
  }, [location]);

  return (
    <>
      <Switch>
        <Route exact path={PathLink.login}><LoginPage /></Route>
        <Route exact path={'/'}>
          <Content
            className="hide-scrollbar"
            style={{
              flex: 1,
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              padding: 0,
            }}
          >
            <PullToRefresh onRefresh={() => {setRefresh(!refresh); getCurrenctBranchInfo()}}>
              <div className={'page-container'}>
                <div className={"screen-navigation"}>
                  <span className={"screen-title"}>
                    {sessionStorage.getItem(SessionStorage.DIVISION_BRANCH_NAME)}
                  </span>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <GoBellFill
                      style={{
                        color: "white",
                        fontSize: "1.3rem",
                        marginRight: "10px"
                      }}
                      onClick={() => {
                        getMobileNotification();
                        setOpenNotification(true);
                      }}
                    />
                    <IoSettings
                      style={{ color: "white", fontSize: "1.3rem" }}
                      onClick={() => {
                        // RemoveLocalStorageOnLogout();
                        // router.push("/login");
                        setOpenSetting(true);
                      }}
                    />
                  </div>
                </div>
                <SpinLoading />
                <div style={{marginTop: "10px"}}>
                  {menu &&
                    menu.map((group, index) => (
                      <div style={{ marginBottom: "20px" }} key={index}>
                        <span className={"menu-group-title"}>
                          {group["FunctionCategoryName"]}
                        </span>
                        {group.Menu.map((item, idx) => (
                          <div
                            className={"menu-item"}
                            key={idx}
                            style={{ "--item-color": item.FunctionColorCode }}
                            onClick={() => item.Route && history.push(item.Route)}
                          >
                            {item.FunctionName}
                            <div className="d-flex align-items-center">
                              {item.PendingItems && item.PendingItems !== 0 ? (
                                <div style={{ padding: "0px 5px" }}>
                                  <span style={{ fontWeight: "600", color: "#d9534f" }}>
                                    {item.PendingItems.toString()}
                                  </span>
                                  &nbsp;
                                  <span
                                    style={{
                                      fontStyle: "italic",
                                      fontWeight: "600",
                                      color: "#d9534f",
                                      fontSize: "0.7rem"
                                    }}
                                  >
                                    Pending
                                  </span>
                                </div>
                              ) : (
                                <></>
                              )}
                              <SlArrowRight
                                style={{
                                  color: "rgb(201, 201, 201)",
                                  fontSize: "0.8rem",
                                  strokeWidth: "100"
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                </div>
              </div>
              <Modal
                open={openSetting}
                onCancel={() => setOpenSetting(false)}
                style={{ top: 0, padding: 0, height: "100vh", width: "100vw" }}
                width={"100vw"}
                // bodyStyle={{ height: "100vh" }}
                closable={true}
                maskClosable={false}
                footer={null}
              >
                <div style={{ marginTop: "20px" }}>
                  You are signed in as{" "}
                  <span style={{ fontWeight: "bold" }}>{getUsernamefromToken()}</span>
                  <div
                    className="test123 d-flex justify-content-between align-items-center"
                    style={{
                      background: "#c1f0ff",
                      padding: "10px",
                      textAlign: "center",
                      borderRadius: "5px"
                    }}
                  >
                    {sessionStorage.getItem(SessionStorage.DIVISION_BRANCH_NAME)}
                    <LuSquareArrowRight style={{ color: "green" }} />
                  </div>
                  {Object.getOwnPropertyNames(branchList).map((item, index) => (
                    <div key={index} style={{ marginTop: "10px" }}>
                      <span style={{ color: "#b1b1b1" }}>{item}</span>

                      {branchList[item].length > 0 &&
                        branchList[item].map((com, comIndex) => (
                          <div
                            key={comIndex}
                            style={{
                              borderLeft: "3px solid #3f87a6",
                              padding: "6px",
                              background: "#fdfdfd"
                            }}
                            onClick={() => {
                              switchBranch(com.DivisionBranchCode);
                              setOpenSetting(false);
                              history.push("/");
                            }}
                          >
                            {com["DivisionBranchName"]}
                          </div>
                        ))}
                    </div>
                  ))}
                  <div
                    className="d-flex align-items-center"
                    style={{
                      marginTop: "20px",
                      background: "#f1f1f1",
                      padding: "6px",
                      borderRadius: "5px"
                    }}
                    onClick={() => {
                      RemoveLocalStorageOnLogout();
                      history.push(PathLink.login);
                    }}
                  >
                    <IoIosLogOut
                      style={{
                        color: "#3f87a6",
                        marginRight: "5px"
                      }}
                    />
                    Log out
                  </div>
                </div>
              </Modal>

              <Modal
                open={openNotification}
                onCancel={() => setOpenNotification(false)}
                style={{ top: 0, padding: 0, height: "100vh", width: "100vw" }}
                width={"100vw"}
                // bodyStyle={{ height: "100vh" }}
                closable={true}
                maskClosable={false}
                footer={null}
              >
                <RangePicker
                  showTime
                  format="YYYY-MM-DD"
                  onChange={(dates) => setDateRange(dates)}
                  style={{ marginBottom: 16 }}
                />
                {notificationData.map((item, index) => (
                  <div key={index} className="notification-card">
                    <div className="d-flex justify-content-between notification-header">
                      <div className="notification-title">{item.Title}</div>
                      <div className="notification-date">{dayjs(item.SentDate).format('YYYY-MM-DD HH:mm:ss')}</div>
                    </div>

                    <div className="notification-content">{item.Content}</div>
                  </div>
                ))}
              </Modal>

            </PullToRefresh>
          </Content>
        </Route>
      </Switch>
    </>
  );
};

export default MainMenu;
