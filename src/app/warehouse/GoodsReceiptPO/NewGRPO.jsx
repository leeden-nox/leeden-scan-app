import { useHistory } from "react-router-dom";
import { useEffect, useState } from "react";
import { DeleteOutlined, SearchOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Button, Card, Col, Collapse, DatePicker, Input, InputNumber, message, Modal, Row, Select, Space, Tag, Typography } from "antd";
import { AxiosWithLoading, ErrorPrinter, SpinLoading } from "../../../constants/Common";
import { APIHelper } from "../../../constants/APIHelper";
import { PathLink } from "../../../constants/PathLink";
import MobilePageShell from "../../../constants/MobilePageShell";
import { SwipeAction, TextArea } from "antd-mobile";
const { Text } = Typography;

const NewGRPO = () => {
  const history = useHistory();
  const [docSeries, setDocSeries] = useState([]);
  const [data, setData] = useState({start: dayjs()});
  const [poList, setPoList] = useState([]);
  const [searchPoVisible, setSearchPoVisible] = useState(false);
  const [showUpdateQtyModal, setShowUpdateQtyModal] = useState({show: false, item: null});

  window.addEventListener("popstate", function () {
    if (searchPoVisible) 
      setSearchPoVisible(false);
    else 
      history.goBack();
  });

  const getDocumentSeries = async () => {
    try {
      const res = await AxiosWithLoading(
        APIHelper.getConfig("/common/getdocumentseries")
      );
      setDocSeries(res.data['SAPQuery_Data']);
    } catch (error) {
      ErrorPrinter(error);
    }
  }

  const postGRPOToSAP = async () => {
    try {
      // 1. document series not null
    }
    catch (error) {
      ErrorPrinter(error);
    }
  }

  const onRemovePo = (index) => {
    let newPoList = poList;
    newPoList.splice(index, 1);
    setPoList(newPoList);
    setData({...data});
  }

  useEffect(() => {
    getDocumentSeries();
  }, []);

  return searchPoVisible ? 
    <SearchPOModal
      visible={searchPoVisible}
      onClose={() => setSearchPoVisible(false)}
      setPoList={setPoList}
      poList={poList}
    /> :
  ( 
    <MobilePageShell title={"New GRN"} onBack={() => history.push(PathLink.processingGRPO)} onRefresh={()=>{}}>
      <SpinLoading />
      <div bordered style={{ marginBottom: 16 }}>
        <div
          direction="vertical"
          size="middle"
          style={{ width: "100%", marginBottom: 80 }}
        >
          <div style={{background:'white', bottom:'1px'}}>
            <Space
              direction="horizontal"
              className="px-2 pb-2"
              style={{ justifyContent: "space-between", width: "100%", borderBottom:'1px solid #ccc' }}
            >
              <Text strong>Document Series</Text>
              <Select 
                optionFilterProp="children"
                placeholder="Document Series"
                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                onChange={(value) => setData({...data, docSeries: value})}
                style={{marginTop:10, width:'100%'}}
              >
                {docSeries.map((item, index) => (
                  <Select.Option key={index} value={item.SeriesName}>
                    {item.SeriesName}
                  </Select.Option>
                ))}
              </Select>
            </Space>

            <Space
              direction="horizontal"
              className="px-2 py-3"
              style={{ justifyContent: "space-between", width: "100%", borderBottom:'1px solid #ccc' }}
            >
              <Text strong>Document Date</Text>
              <DatePicker 
                className={'compact-calender'} 
                onChange={(date) => setData({...data, start: date})} 
                value={data.start} 
                allowClear={false} 
                size={"small"} 
              />
            </Space>

            <Space
              direction="horizontal"
              className="px-2 py-2"
              style={{ justifyContent: "space-between", width: "100%", borderBottom:'1px solid #ccc' }}
            >
              <Text strong>Vendor Ref No</Text>
              <Input bordered={false} placeholder='' style={{width:'45vw'}} value={data.vendor} onChange={(e) => setData({...data, vendor: e.target.value})} />
            </Space>

            <Space
              direction="horizontal"
              className="px-2 py-3"
              style={{ justifyContent: "space-between", width: "100%", borderBottom:'1px solid #ccc' }}
            >
              <TextArea placeholder="Remarks" style={{width:'100vw'}} rows='2' value={data.remarks} onChange={(e) => setData({...data, remarks: e.target.value})} />
            </Space>
          </div>
          {poList.map((item, index) => (
            <SwipeAction
              rightActions={[
                  {
                    key: 'delete',
                    text: <DeleteOutlined />,
                    color: 'danger',
                    onClick: () => onRemovePo(index),
                  }
                ]}
            >
              <Card
                key={index}
                style={{ margin: 12, borderRadius: 12 }}
                bodyStyle={{ padding: 10 }}
              >
                <Row justify="space-between" align="middle">
                  <Text strong>{item.SAPDocNum}</Text>
                  <RightOutlined />
                </Row>
                <Row justify="space-between">
                  <Col style={{width:'85%'}}>
                    <Text style={{fontSize:'0.8rem'}} strong>{item.ItemCode}</Text>
                    <br />
                    <Text style={{fontSize:'0.8rem'}} type="secondary">{item.ItemName}</Text>
                  </Col>
                  <Col style={{margin:'auto'}}><Tag style={{padding:'0.35rem'}} color="gold">{item.Warehouse}</Tag></Col>
                </Row>
                <Row align="middle" style={{ marginTop: 5 }} gutter={8}>
                  <Col>
                    <Tag color={item.IsTrackedBatch === '1' ? 'orange' : item.IsTrackedSerial === '1' ? 'bluelight' : "green"}>{item.IsTrackedBatch === '1' ? 'Batch' : item.IsTrackedSerial === '1' ? 'Serial' : 'Non BatchSerial'}</Tag>
                  </Col>
                  <Col flex="auto" />
                  <Col onClick={() => setShowUpdateQtyModal({show: true, item})}>
                    <Text strong>{String(Number(item.Quantity))} out of {String(Number(item.OpenQty))}&nbsp;{item.BasedUOM}&nbsp;</Text>
                  </Col>
                </Row>
              </Card>
            </SwipeAction>
          ))}
        </div>
        
        <div style={{background:'white', position:'absolute', width:'100vw', bottom:'1px' }}>
          {poList.length > 0 && (
            <Button
              type="primary"
              block
              onClick={() => {}}
              style={{ backgroundColor: "#377188", marginBottom: '0.5rem' }}
            >
              Post to SAP
            </Button>
          )}
          <Button
            type="primary"
            block
            onClick={() => setSearchPoVisible(true)}
            style={{ backgroundColor: "#377188", }}
          >
            Add New Item
          </Button>
        </div>
      </div>

      <Modal
        open={showUpdateQtyModal.show}
        title="Edit Info"
        onCancel={() => setShowUpdateQtyModal({show: false, item: null})}
        onOk={() => {
          if (!showUpdateQtyModal.item.Quantity || parseFloat(showUpdateQtyModal.item.Quantity) <= 0) {
            message.error("Please enter a valid quantity");
            return;
          }
          else if (parseFloat(showUpdateQtyModal.item.Quantity) > parseFloat(showUpdateQtyModal.item.OpenQty)) {
            message.error("Quantity cannot be more than Open Quantity");
            return;
          }
          else {
            const newItem = poList.find(itm => itm.LineItemNo === showUpdateQtyModal.item.LineItemNo && itm.SAPDocNum === showUpdateQtyModal.item.SAPDocNum && itm.VendorCode === showUpdateQtyModal.item.VendorCode);
            if (newItem) newItem.Quantity = showUpdateQtyModal.item.Quantity;
          }
          setShowUpdateQtyModal({show: false, item: null});
        }}
      >
        <div>Product: {showUpdateQtyModal.item && showUpdateQtyModal.item.ItemName}</div>  
        <div>Open Qty: {showUpdateQtyModal.item && String(Number(showUpdateQtyModal.item.OpenQty))}</div>
        <div>
          Qty Received: &nbsp;
          <InputNumber 
            min={0} 
            value={showUpdateQtyModal.item && showUpdateQtyModal.item.Quantity} 
            controls={false}
            style={{width:70, textAlign:'center'}}
            onChange={(value) => {
              setShowUpdateQtyModal({...showUpdateQtyModal, item: {...showUpdateQtyModal.item, Quantity: value}});
            }}
          />
        </div>
      </Modal>
    </MobilePageShell>
   );
}

const SearchPOModal = ({visible, onClose, setPoList, poList}) => {
  const [search, setSearch] = useState({});
  const [data, setData] = useState([]);

  const getOpenPO = async () => {
    try {
      const res = await AxiosWithLoading(
        APIHelper.getConfig("/good/getopenpo?vendorname=" + (search.vendorName || '') + "&prodcode=" + (search.productCode || '') + "&prodname=" + (search.productName || '') + "&pono=" + (search.purchaseOrderNo || ''))
      );
      console.log('data: ', res['SAPQuery_Data']);
      // setData([
      //   {
      //       "LineItemNo": "3",
      //       "OpenQty": "3.000000",
      //       "Purchaser": "S10498",
      //       "PurchaserName": "CHENG FONG LING",
      //       "CurrentExchangeRate": "1.300000",
      //       "UOM": "CYL",
      //       "BasedQty": "1.000000",
      //       "BasedUOM": "CYL",
      //       "ConvertedQty": "1.000000",
      //       "ConvertedUOM": "CYL",
      //       "IsTrackedBatch": "0",
      //       "IsTrackedSerial": "0",
      //       "UpdateDate": "11/8/2017 12:00:00 AM",
      //       "UpdateTime": "141708",
      //       "SAPDocNum": "1000033",
      //       "CustomDocNum": "MRG1700036",
      //       "ItemCode": "WD3BCL30006",
      //       "ItemName": "BORON TRICHLORIDE BCL3 99.9995% DISS634 47L 50KG",
      //       "DocStatus": "O",
      //       "LineStatus": "O",
      //       "VendorCode": "CRMGP",
      //       "VendorName": "Matheson Gas Products Korea Co., Ltd",
      //       "UnitPrice": "3600.000000",
      //       "SAPDocEntry": "121",
      //       "Dimension1": "GAS",
      //       "Dimension2": "L2NA",
      //       "Dimension3": "L3NA",
      //       "Dimension4": "L4NA",
      //       "LineDiscount": "0.000000",
      //       "TaxType": "PN",
      //       "Warehouse": "G02",
      //       "Field32": "USD",
      //       "Field33": "0.000000",
      //       "Field34": "3600.000000",
      //       "Field35": "85279",
      //       "Field36": "Y",
      //       "Field37": null,
      //       "Field38": null,
      //       "Field39": null,
      //       "Field40": null,
      //       "IsBin": false,
      //       "DefaultSystemBin": ""
      //   },
      //   {
      //       "LineItemNo": "1",
      //       "OpenQty": "96.000000",
      //       "Purchaser": "S10498",
      //       "PurchaserName": "CHENG FONG LING",
      //       "CurrentExchangeRate": "1.374600",
      //       "UOM": "CYL",
      //       "BasedQty": "1.000000",
      //       "BasedUOM": "CYL",
      //       "ConvertedQty": "1.000000",
      //       "ConvertedUOM": "CYL",
      //       "IsTrackedBatch": "0",
      //       "IsTrackedSerial": "0",
      //       "UpdateDate": "11/8/2017 12:00:00 AM",
      //       "UpdateTime": "141721",
      //       "SAPDocNum": "1000034",
      //       "CustomDocNum": "MRG1700109",
      //       "ItemCode": "WE3WF600003",
      //       "ItemName": "TUNGSTEN HEXAFLUORIDE WF6 99.9995% 70KG 40L",
      //       "DocStatus": "O",
      //       "LineStatus": "O",
      //       "VendorCode": "COS010",
      //       "VendorName": "SK Specialty Co., Ltd.",
      //       "UnitPrice": "6180.300000",
      //       "SAPDocEntry": "124",
      //       "Dimension1": "GAS",
      //       "Dimension2": "L2NA",
      //       "Dimension3": "L3NA",
      //       "Dimension4": "L4NA",
      //       "LineDiscount": "0.000000",
      //       "TaxType": "PN",
      //       "Warehouse": "G02",
      //       "Field32": "USD",
      //       "Field33": "0.000000",
      //       "Field34": "6180.300000",
      //       "Field35": "89802",
      //       "Field36": "Y",
      //       "Field37": null,
      //       "Field38": null,
      //       "Field39": null,
      //       "Field40": null,
      //       "IsBin": false,
      //       "DefaultSystemBin": ""
      //   },
      // ])
    } catch (error) {
      ErrorPrinter(error);
    }
  }

  const addPOItem = (item) => {
    try {
      if (!item.Quantity || parseFloat(item.Quantity) <= 0) {
        message.error("Please enter a valid quantity");
        return;
      }
      else if (parseFloat(item.Quantity) > parseFloat(item.OpenQty)) {
        message.error("Quantity cannot be more than Open Quantity");
        return;
      }
      else if (!(poList.some(po => po.SAPDocNum === item.SAPDocNum && po.LineItemNo === item.LineItemNo && po.VendorCode === item.VendorCode))) {
        setPoList([...poList, item]);
        message.success("Item added successfully");
      }
    }
    catch (error) {
      ErrorPrinter(error);
    }
  }

  return visible && (
    <MobilePageShell title={'Search PO'} onBack={onClose}>
      <SpinLoading />
      <div>
        <Input 
          placeholder="Purchase Order No" 
          className="m-2" 
          style={{width:'90vw'}} 
          value={search.purchaseOrderNo} 
          onChange={(e) => setSearch({...search, purchaseOrderNo: e.target.value})} 
          suffix={<SearchOutlined onClick={() => getOpenPO()} style={{ color: 'rgba(0,0,0,.45)' }} />}
        />
        <Collapse ghost>
          <Collapse.Panel style={{fontSize:'small', paddingTop:'0px', paddingBottom: '0px'}} header="Filters" key="1">
            <Input 
              placeholder="Vendor name" 
              // className="m-2" 
              style={{width:'85vw'}} 
              value={search.vendorName} 
              onChange={(e) => setSearch({...search, vendorName: e.target.value})} 
            />
            <Input 
              placeholder="Product code" 
              className="mt-2" 
              style={{width:'85vw'}} 
              value={search.productCode} 
              onChange={(e) => setSearch({...search, productCode: e.target.value})} 
            />
            <Input 
              placeholder="Product name" 
              className="mt-2" 
              style={{width:'85vw'}} 
              value={search.productName} 
              onChange={(e) => setSearch({...search, productName: e.target.value})} 
            />
          </Collapse.Panel>
        </Collapse>
        <div style={{ maxWidth: 420, margin: "auto", padding: 10 }}>
          {data.map((item, index) => (
            <Card
              key={index}
              style={{ marginBottom: 12, borderRadius: 12 }}
              bodyStyle={{ padding: 10 }}
            >
              <Row justify="space-between" align="middle">
                <Text strong>{item.SAPDocNum}</Text>
                <RightOutlined />
              </Row>
              <Row justify="space-between" style={{ marginTop: 6 }}>
                <Col style={{width:'75%'}}>
                  <Text strong>{item.VendorCode}</Text>
                  <br />
                  <Text type="secondary">{item.VendorName}</Text>
                </Col>
                <Col style={{ textAlign: "center" }}>
                  <InputNumber min={0} value={item.Quantity} controls={false}
                    style={{width:70, textAlign:'center'}}
                    onChange={(val) => {
                      const newItem = data.find(itm => itm.LineItemNo === item.LineItemNo && itm.SAPDocNum === item.SAPDocNum && itm.VendorCode === item.VendorCode);
                      if (newItem) newItem.Quantity = val;
                    }}
                  />
                  <br />
                  <Text type="secondary">{item.BasedUOM}</Text>
                </Col>
              </Row>
              <Row justify="space-between" style={{ marginTop: 8 }}>
                <Col style={{width:'80%'}}>
                  <Text strong>{item.ItemCode}</Text>
                  <br />
                  <Text type="secondary">{item.ItemName}</Text>
                </Col>
                <Col style={{margin:'auto'}}><Tag style={{padding:'0.5rem'}} color="gold">{item.Warehouse}</Tag></Col>
              </Row>
              <Row align="middle" style={{ marginTop: 10 }} gutter={8}>
                <Col>
                  <Tag color={item.IsTrackedBatch === '1' ? 'orange' : item.IsTrackedSerial === '1' ? 'bluelight' : "green"}>{item.IsTrackedBatch === '1' ? 'Batch' : item.IsTrackedSerial === '1' ? 'Serial' : 'Non BatchSerial'}</Tag>
                </Col>
                <Col flex="auto" />
                <Col>
                  <Text strong>{String(Number(item.OpenQty))}&nbsp;{item.BasedUOM}&nbsp;{item.UOM !== item.BasedUOM && parseFloat(item.OpenQty)*parseFloat(item.ConvertedQty)/parseFloat(item.BasedQty)}&nbsp;{item.UOM !== item.BasedUOM && item.UOM}</Text>
                </Col>
                <Col>
                  <Button
                    type="primary"
                    shape="circle"
                    onClick={() => addPOItem(item)}
                    icon={<PlusOutlined />}
                  />
                </Col>
              </Row>
            </Card>
          ))}
        </div>
      </div>
    </MobilePageShell>
  )
}
 
export default NewGRPO;