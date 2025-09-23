import { useHistory } from "react-router-dom";
import MobilePageShell from "../../constants/MobilePageShell";
import { useEffect, useState } from "react";
import { AxiosWithLoading, ErrorPrinter, SpinLoading } from "../../constants/Common";
import { APIHelper } from "../../constants/APIHelper";
import UnauthorizedPage from "../../constants/Unauthorized";
import { AutoComplete, Checkbox, Input, notification, Select, Table } from "antd";

const UserAccess = () => {
  const history = useHistory();
  const [authorized, setAuthorized] = useState(true);
  const [userRoleList, setUserRoleList] = useState([]);
  const [data, setData] = useState();
  const [roleAccessList, setRoleAccessList] = useState([]);
  const { Option } = Select;

  const initial = async () => {
    try {
      let body = {
        ParamList: 'ScanAppUserAccess'
      }
      const response = await AxiosWithLoading(
        APIHelper.postConfig("/common/scanAppUserAccessGrant", body)
      );
      setUserRoleList(response.data['ScanAppUserAccess']);
      setAuthorized(true);
    }
    catch (error) {
      setAuthorized(false);
      ErrorPrinter(error);
    }
  }

  const gerUserRoleAccess = async (roleId) => {
    try{
      const response = await AxiosWithLoading(
        APIHelper.getConfig("/common/getNextScanAppUserRoleAccess?roleId=" + roleId)
      );
      setRoleAccessList(response.data['Table']);
    }
    catch (error) {
      setAuthorized(false);
      ErrorPrinter(error);
    }
  }

  const updateUserRoleAccess = async (roleId, functionId, haveAccess) => {
    try {
      let body = {
        RoleId: roleId,
        FunctionId: functionId,
        Access: haveAccess ? 1 : 0
      }
      const response = await AxiosWithLoading(
        APIHelper.postConfig("/common/updateNextScanUserRoleAccess", body)
      );
      if (response.status === 200) {
        notification.success({ message: 'Success', description: 'User role access updated successfully', placement: 'bottomRight'});
        gerUserRoleAccess(roleId);
      }
    }
    catch (error) {
      ErrorPrinter(error);
    }
  }

  useEffect(() => {
    initial();
  }, []);

  const columns = [
    {
      title:'Module',
      key: 'FunctionName',
      dataIndex: 'FunctionName',
      width: '70%'
    },
    {
      title:'Access',
      render: (text, record) => (
        <span><Checkbox checked={record.HaveAccess === 1} onChange={(e) => updateUserRoleAccess(data, record.FunctionID, e.target.checked)} /></span>
      ),
      width: '30%'
    }
  ]

  return ( 
    <MobilePageShell title={'User Access'} onBack={() => history.push('/')} onRefresh={initial}>
      <SpinLoading />
      {authorized ? (
        <div>
          <Select 
            showSearch
            optionFilterProp="children"
            placeholder="Select Role"
            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
            value={data}
            onChange={(value) => {setData(value); gerUserRoleAccess(value)}}
            style={{margin:20, width:'80%'}}
          >
            {userRoleList.map((role) => (
              <Option value={role.RoleID} key={role.RoleID}>{role.RoleName}</Option>
            ))}
          </Select>

          {roleAccessList && (
            <>
              <h3 className='px-3'>{userRoleList.find((role) => role.RoleID === data)?.RoleName}</h3>
              <Table 
                columns={columns}
                dataSource={roleAccessList} 
                pagination={false} 
                rowKey="FunctionID"
              />
            </>
          )}
        </div>
      ) : (
        <div>
          <UnauthorizedPage title={"User Access (99.9.9.9-9)"} subTitle={"Sorry, you are not authorized to access this page."}/>
        </div>
      )}
    </MobilePageShell>
   );
}
 
export default UserAccess;