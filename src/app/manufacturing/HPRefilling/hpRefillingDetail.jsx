import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { RiDeleteBin7Line } from "react-icons/ri";
import { Input, InputNumber, notification, Select, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import { IoMdAddCircle } from "react-icons/io";
import { MdChevronRight } from "react-icons/md";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { APIHelper } from "../../../constants/APIHelper";
import { AxiosWithLoading, ErrorPrinter, playSound, ScanListener, SpinLoading } from "../../../constants/Common";
import MobilePageShell from "../../../constants/MobilePageShell";
import { PathLink } from "../../../constants/PathLink";
import UnauthorizedPage from "../../../constants/Unauthorized";
import { SwipeAction } from 'antd-mobile';
const { Text } = Typography;

const HPRefillingDetail = () => {
  const history = useHistory();
  const [authorized, setAuthorized] = useState(true);
  const [data, setData] = useState({});
  const [gasTypeList, setGasTypeList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [pipelineList, setPipelineList] = useState([]);
  const [searchGasModalVisible, setSearchGasModalVisible] = useState(false);
  const [searchProductModalVisible, setSearchProductModalVisible] = useState(false);
  const [serialNo, setSerialNo] = useState('');
  const location = useLocation();
  const { id } = useParams();

  const initialize = async () => {
    try {
      const response = await AxiosWithLoading(
        APIHelper.getConfig("/production/CreateNewRefillBatch")
      );
      setAuthorized(true);
      setGasTypeList(response.data['records']);
    } catch (error) {
      setAuthorized(false);
      ErrorPrinter(error);
    }
  }

  const getProductByGasType = async (gasTypeId) => {
    try {
      const response = await AxiosWithLoading(
        APIHelper.getConfig("/production/GetProductByGasType?GasTypeID=" + gasTypeId)
      );
      setAuthorized(true);
      setProductList(response.data['records']);
    } catch (error) {
      setAuthorized(false);
      ErrorPrinter(error);
    }
  }

  const getRefillLineByProduct = async (prodCode) => {
    try {
      const response = await AxiosWithLoading(
        APIHelper.getConfig("/production/GetRefillLineByProd?ProdCode=" + prodCode)
      );
      setAuthorized(true);
      setPipelineList(response.data['records']);
    } catch (error) {
      setAuthorized(false);
      ErrorPrinter(error);
    }
  }

  const onAddSerialNo = (barcode) => {
    if (!data.PipelineName) {
      notification.error({
        message: "Error",
        description: 'Please select pipeline for all the base gases',
        placement: "bottomRight",
      });
    }
    else if (!serialNo && !barcode) {
      notification.error({
        message: "Error",
        description: 'Please select serial',
        placement: "bottomRight",
      });
    }
    else if (!data.ProdCode) {
      notification.error({
        message: "Error",
        description: 'Please enter Product Code',
        placement: "bottomRight",
      });
    }
    else if (!data.GasTypeID) {
      notification.error({
        message: "Error",
        description: 'Please select Gas Type',
        placement: "bottomRight",
      });
    }
    else if (!data.OwnerType) {
      notification.error({
        message: "Error",
        description: 'Please select owner type',
        placement: "bottomRight",
      });
    }
    else if (['COP', 'SOP'].includes(data.OwnerType) && !data.CustomerCode) {
      notification.error({
        message: "Error",
        description: 'Please enter customer code',
        placement: "bottomRight",
      });
    }
    else {
      if (!barcode) {
        let serialList = data.SerialNoList || [];
        serialList.push({SerialNo: serialNo, OwnerType: data.OwnerType, CustomerCode: data.CustomerCode || ''});
        setData({...data, SerialNoList: serialList});
        setSerialNo('');
      }
      else {
        playSound();
        let serialList = data.SerialNoList || [];
        serialList.push({SerialNo: barcode, OwnerType: data.OwnerType, CustomerCode: data.CustomerCode || ''});
        setData({...data, SerialNoList: serialList});
      }
    }
  }

  const onRemoveSerialNo = (index) => {
    let serialList = data.SerialNoList || [];
    serialList.splice(index, 1);
    setData({...data, SerialNoList: serialList});
  }

  useEffect(() => {
    initialize();
  }, [location]);

  if (!authorized) {
    return (
      <MobilePageShell
        title={"HP Refilling"}
        onRefresh={initialize}
        onBack={() => history.goBack()}
      >
        <UnauthorizedPage
          title={'HP Refilling'}
          subTitle={'Sorry, you do not have access to do refilling'}
        />
      </MobilePageShell>
    )
  }
  return searchGasModalVisible ? (
    <SearchGasModal 
      visible={searchGasModalVisible}
      list={gasTypeList}
      onClose={() => setSearchGasModalVisible(false)}
      setData={setData}
      data={data}
      getProductByGasType={getProductByGasType}
    />
  ) : searchProductModalVisible ? (
    <SearchProductModal 
      visible={searchProductModalVisible}
      list={productList}
      onClose={() => setSearchProductModalVisible(false)}
      setData={setData}
      data={data}
      getRefillLineByProduct={getRefillLineByProduct}
    />
  ) :
   ( 
    <MobilePageShell 
      title={id === '0' ? 'New HP Refilling' : 'Batch No'} 
      onBack={() => history.push(PathLink.hpRefilling)}
    >
      <SpinLoading />
      {/* HP Refilling Detail Content Goes Here */}
      <div bordered style={{ marginBottom: 16 }}>
        {/* <Form layout="vertical"> */}
        <div
          direction="vertical"
          size="middle"
          style={{ width: "100%" }}
        >
          <div className="py-2" style={{background:'white'}}>
            <Space
              direction="horizontal"
              className="px-2 pb-2"
              style={{ justifyContent: "space-between", width: "100%", borderBottom:'1px solid #ccc' }}
            >
              <Text strong>Gas Type</Text>
              <div className="d-flex justify-content-end" style={{width:'70vw'}} onClick={() => setSearchGasModalVisible(true)}>
                <Text style={{color:'#888'}}>
                  {data.GasTypeName}
                  <MdChevronRight />
                </Text>
              </div>
            </Space>
            
            <Space
              direction="horizontal"
              className="px-2 py-1"
              style={{ justifyContent: "space-between", width: "100%" }}
            >
              <Text strong>Product</Text>
              <div className="d-flex justify-content-end" style={{width:'70vw'}} onClick={() => setSearchProductModalVisible(true)}>
                <Text style={{fontSize:'0.8rem',color:'#888'}} onClick={() => {}}>{data.ProdCode} - {data.ProdName}</Text>
                {!data.ProdCode && <MdChevronRight />}
              </div>
            </Space>
          </div>

          {/* line used */}
          {data.GasTypeID && data.ProdCode && (
            <>
              <Space className='px-2 py-2'>
                <Text style={{color:'#888', fontSize:'0.8rem'}}>Line Used</Text>
              </Space>
              <div className="py-2" style={{background:'white'}}>
                <Space
                  className="px-2 py-2"
                  direction="horizontal"
                  style={{ justifyContent: "space-between", width: "100%" }}
                >
                  <div style={{width:'100px', fontWeight: '600', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}} strong>{data.GasTypeName || 'Line Used'}</div>
                  <div>
                    <Text onClick={() => {}}>
                      <Select 
                        label={'-'}
                        // options={pipelineList}
                        value={data.PipelineName}
                        optionFilterProp="children"
                        style={{width:'60vw'}}
                        onSelect={(e) => setData({...data, PipelineName: e})}
                      >
                        {pipelineList.map((pipeline, index) => (
                          <Select.Option key={index} value={pipeline.PipelineName}>
                            {pipeline.PipelineName}
                          </Select.Option>
                        ))}
                      </Select>
                      {/* <MdChevronRight /> */}
                    </Text>
                    
                  </div>
                </Space>
                <Space
                  className="px-2 py-2"
                  direction="horizontal"
                  style={{ justifyContent: "space-between", width: "100%" }}
                >
                  <Text strong>BAR</Text>
                  <div>
                    <InputNumber className="borderless-right-input" value={data.Bar} onChange={(value) => setData({...data, Bar: value})} bordered={false} />
                  </div>
                </Space>
              </div>
            </>
          )}

          <div className="py-2 mt-3" style={{background:'white'}}>
            <Space
              direction="horizontal"
              className="px-2 pb-2"
              style={{ justifyContent: "space-between", width: "100%", borderBottom:'1px solid #ccc' }}
            >
              <Text strong>Owner Type</Text>
              <div>
                {/* <Text onClick={() => {}}>{'COP/NOP/SOP'}<MdChevronRight /></Text> */}
                <Select 
                  label={'-'}
                  // options={pipelineList}
                  value={data.OwnerType}
                  optionFilterProp="children"
                  style={{width:'30vw'}}
                  onSelect={(e) => setData({...data, OwnerType: e})}
                >
                  <Select.Option value={''}>-</Select.Option>
                  <Select.Option value={'NOP'}>NOP</Select.Option>
                  <Select.Option value={'COP'}>COP</Select.Option>
                  <Select.Option value={'SOP'}>SOP</Select.Option>
                </Select>
              </div>
            </Space>
            {['COP', 'SOP'].includes(data.OwnerType) && (
              <Space
                direction="horizontal"
                className="px-2 py-2"
                style={{ justifyContent: "space-between", width: "100%" }}
              >
                <Text strong>Customer Code</Text>
                <div>
                  <Input 
                    value={data.CustomerCode} 
                    onChange={(e) => setData({...data, CustomerCode: e.target.value})} />
                </div>
              </Space>
            )}
            <Space
              direction="horizontal"
              className="px-2 py-2"
              style={{ justifyContent: "end", width: "100%" }}
            >
              <Text className='mr-5' style={{color:'#888'}}>
                <Input bordered={false} placeholder='Serial No' style={{width:'45vw'}} value={serialNo} onChange={(e) => setSerialNo(e.target.value)} />
              </Text>
              <IoMdAddCircle
                size={25}
                strokeWidth={1}
                color='#0073a1'
                onClick={() => onAddSerialNo()}
              />
            </Space>
          </div>

          <Space className='mt-3 px-2 py-2'>
            <Text style={{color:'#888', fontSize:'0.8rem'}}>Serial Number</Text>
          </Space>
          <div style={{background:'white'}}>
            {data.SerialNoList && data.SerialNoList.map((serial, index) => (
              <SwipeAction
                rightActions={[
                    {
                      key: 'delete',
                      text: <DeleteOutlined />,
                      color: 'danger',
                      onClick: () => onRemoveSerialNo(index),
                    }
                  ]}
              >
                <div>
                  <div className='d-flex justify-content-between py-2 px-3' style={{borderBottom:'1px solid #ccc'}} key={index}>
                    <div>
                      <div>{serial.SerialNo}</div>
                      <div className='ownerType-badge'>{serial.OwnerType}</div>
                    </div>
                    <div>
                      <div>{data.ProdCode}</div>
                      <div className='text-end'>{serial.CustomerCode}</div>
                    </div>
                  </div>
                </div>
              </SwipeAction>
            ))}
          </div>
        </div>
        <ScanListener onScanDetected={(barcode) => onAddSerialNo(barcode)} />
        {/* </Form> */}
      </div>
    </MobilePageShell>
   );
}

const SearchGasModal = ({
  visible,
  list = [],
  onClose,
  setData,
  data,
  getProductByGasType
}) => {
  const [search, setSearch] = useState('');

  return visible && (
    <MobilePageShell title={'Search Gas Type'} onBack={onClose}>
      <SpinLoading />
      <div>
        <Input 
          placeholder="Search" 
          className="m-2" 
          style={{width:'95vw'}} 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
        />
        {list.filter(item => item.text.toLowerCase().includes(search.toLowerCase())).map((detail, index) => (
          <div 
            className="px-3 py-3" 
            key={index} 
            style={{borderBottom: '1px solid #ccc'}}
            onClick={() => {
              setData({...data, GasTypeID: detail.id, GasTypeName: detail.text, ProdCode: '', ProdName: '', PipelineName: ''});
              getProductByGasType(detail.id);
              onClose();
            }}
          >
            <span>{detail.text}</span>
          </div>
        ))}
      </div>
    </MobilePageShell>
  )
}

const SearchProductModal = ({
  visible,
  list = [],
  onClose,
  setData,
  data,
  getRefillLineByProduct
}) => {
  const [search, setSearch] = useState('');

  return visible && (
    <MobilePageShell title={'Search Product'} onBack={onClose}>
      <SpinLoading />
      <div>
        <Input 
          placeholder="Search" 
          className="m-2" 
          style={{width:'95vw'}} 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
        />
        {list.filter(item => item.ProdCode.toLowerCase().includes(search.toLowerCase())).map((detail, index) => (
          <div 
            className="px-3 py-2" 
            key={index} 
            style={{borderBottom: '1px solid #ccc'}}
            onClick={() => {
              setData({...data, ProdCode: detail.ProdCode, ProdName: detail.ProdName, PipelineName: ''});
              getRefillLineByProduct(detail.ProdCode);
              onClose();
            }}
          >
            <span>{detail.ProdCode}</span>
            <br/>
            <span style={{color:'#888', fontSize:'0.8rem'}}>{detail.ProdName}</span>
          </div>
        ))}
      </div>
    </MobilePageShell>
  )
}
 
export default HPRefillingDetail;