import React, { useState } from "react";
import { Card, Row, Col, Typography, Button, Select, List, Input, InputNumber, message, Modal } from "antd";
import {
  ArrowLeftOutlined,
  CameraOutlined,
  DeleteOutlined,
  PlusOutlined,
  RightOutlined,
} from "@ant-design/icons";
import MobilePageShell from "../../../constants/MobilePageShell";
import { SwipeAction } from "antd-mobile";

const { Title, Text } = Typography;

const GRPOBatch = ({item, onBack, poList, setPoList}) => {
  const [batchSerialData, setBatchSerialData] = useState([]);
  const [tempData, setTempData] = useState({});
  const [showModal, setShowModal] = useState({show: false, batchNo: ''});
  return (
    <MobilePageShell title={"New GRN"} onBack={onBack} onRefresh={()=>{}}>
      <div >
        {/* Product Info */}
        <Card style={{borderRadius:8}}>
          <Row gutter={[0, 12]}>
            <Col span={5}>
              <Text>Product:</Text>
            </Col>
            <Col span={19}>
              <Text type="secondary" style={{ display:'block', textAlign: "right", fontSize:'0.85rem' }}>
                {item.ItemCode} - {item.ItemName}
              </Text>
            </Col>

            <Col span={12}>
              <Text>Open Qty</Text>
            </Col>
            <Col span={12} style={{ textAlign: "right" }}>
              <Text type="secondary">{String(Number(item.OpenQty))}&nbsp;{item.BasedUOM}</Text>
            </Col>

            <Col span={12}>
              <Text>Received Qty:</Text>
            </Col>
            <Col span={12} style={{ textAlign: "right" }}>
              <Text type="secondary">{(item.DetailBatch || []).reduce((sum, itm) => sum + itm.Qty, 0)}</Text>
            </Col>
          </Row>

          <div className="d-flex justify-content-between align-items-center mt-3">
             <Input bordered={false} placeholder='Batch Number' style={{width:'45vw'}} value={tempData.BatchNo} onChange={(e) => setTempData({...tempData, BatchNo: e.target.value})} />
            <InputNumber 
              min={0} 
              value={tempData.Qty} 
              bordered={false}
              placeholder="Quantity"
              controls={false}
              style={{width:80, textAlign:'center'}}
              onChange={(value) => {
                setTempData({...tempData, Qty: value});
              }}
            />
            <Text></Text>
            <div>
              <Button
                type="primary"
                shape="circle"
                icon={<PlusOutlined />}
                onClick={() => {
                  const currentTotal = (item.DetailBatch || []).reduce((sum, itm) => sum + itm.Qty, 0);
                  if (!tempData.BatchNo) {
                    message.error("Please enter Batch Number");
                    return;
                  }
                  else if (!tempData.Qty || tempData.Qty <= 0) {
                    message.error("Please enter valid Quantity");
                    return;
                  }
                  else if (currentTotal + (tempData.Qty || 0) > Number(item.OpenQty)) {
                    message.error("Received Qty more than Open Qty");
                    return;
                  }
                  const newItem = poList.find(itm => itm.LineItemNo === item.LineItemNo && itm.SAPDocNum === item.SAPDocNum && itm.VendorCode === item.VendorCode);
                  if (newItem) newItem.DetailBatch = [...(newItem.DetailBatch || []), tempData];
                  setPoList([...poList]);
                  setTempData({});
                }}
              />
            </div>
          </div>
        </Card>

        {/* Prefix */}
        <Card style={{ marginTop: 12 }}>
          <Row align="middle">
            <Col span={6}>
              <Text>Prefix:</Text>
            </Col>
            <Col span={18}>
              <Select value="Default" style={{ width: "100%" }}>
                <Select.Option value="Default">Default</Select.Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Batch List */}
        <div className="my-3" style={{ padding:'0rem 1rem' }}>
          <List
            header={
              <Row>
                <Col span={12}>
                  <Text strong>Batch No</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Quantity</Text>
                </Col>
              </Row>
            }
            dataSource={item.DetailBatch || []}
            renderItem={(item) => (
              <SwipeAction
                rightActions={[
                    {
                      key: 'delete',
                      text: <DeleteOutlined />,
                      color: 'danger',
                      onClick: () => {setShowModal({show: true, batchNo: item.BatchNo})},
                    }
                  ]}
              >
                <List.Item>
                  <Row style={{ width: "100%" }} align="middle">
                    <Col span={12}>
                      <Text>{item.BatchNo}</Text>
                    </Col>
                    <Col span={10}>
                      <Text>{item.Qty}</Text>
                    </Col>
                    <Col span={2} style={{ textAlign: "right" }}>
                      <RightOutlined />
                    </Col>
                  </Row>
                </List.Item>
              </SwipeAction>
            )}
          />
        </div>

        <Modal
          open={showModal.show}
          onCancel={() => setShowModal({show: false, batchNo: ''})}
          title={'Confirm Deletion'}
          onOk={() => {
            const newItem = poList.find(itm => itm.LineItemNo === item.LineItemNo && itm.SAPDocNum === item.SAPDocNum && itm.VendorCode === item.VendorCode);
            const x = newItem.DetailBatch.filter(itm => itm.BatchNo !== showModal.batchNo);
            newItem.DetailBatch = x;
            setPoList([...poList]);
            setShowModal({show: false, batchNo: ''});
          }}
        >
          <p>Are you sure you want to delete batch number {showModal.batchNo}?</p>
        </Modal>
      </div>
    </MobilePageShell>
  );
}
 
export default GRPOBatch;