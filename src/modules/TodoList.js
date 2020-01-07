import React from 'react';
import * as PropTypes from 'prop-types';
import {Row, Col, Typography, List, Button, Modal} from 'antd';
import {MissionFactory, NodeType, RootMission} from "../model/Mission";
import MissionEditor from "./MissionEditor";

export default class TodoList extends React.Component{
  static propTypes = {
    rootMission: PropTypes.instanceOf(RootMission).isRequired,
    onChange: PropTypes.func.isRequired, // 数据变化
    onSave: PropTypes.func.isRequired, // 保存
    onImport: PropTypes.func.isRequired, // 导入
    onExport: PropTypes.func.isRequired, // 导出
  };

  state = {
    showModal: false
  };

  handleAddButton = () => {
    this.handleOpenEditor();
  };

  handleOpenEditor = () => {
    this.setState({
      showModal: true
    });
  };

  handleCloseEditor = () => {
    this.setState({
      showModal: false
    })
  };

  handleSaveEditor = (parentNode)=>{
    this.handleRefreshNode(parentNode);
    this.handleCloseEditor();
  };

  handleRefreshNode = (node) => {
    const rootNode = this.props.rootMission;
    if(node.type === NodeType.root){
      this.props.onChange(node);
    }else{
      this.props.onChange(MissionFactory.refreshNode(rootNode,node));
    }

  };

  render() {
    const missionList = this.props.rootMission.children;
    return (
      <>
        <Row type="flex" justify="center">
          <Col>
            <Typography.Title>I CAN DO</Typography.Title>
          </Col>
        </Row>
        <Row type="flex" justify="center" style={{minHeight: '50vh'}}>
          <Col span={18}>
            <List dataSource={missionList} rowKey={(mission)=>mission.id} renderItem={(mission)=>{
              return (
                <li key={mission.id}>
                  <div>
                    {mission.title}
                  </div>
                </li>
              )
            }}>
            </List>
          </Col>
          <Col span={10}>
            <Button type="primary" block onClick={this.handleAddButton}>add mission</Button>
          </Col>
        </Row>
        <Row type="flex" justify="center">
          <Col span={4}>
            <Button type="default" block onClick={this.props.onSave}>save</Button>
          </Col>
          <Col span={4}>
            <Button type="default" block onClick={this.props.onExport}>export</Button>
          </Col>
          <Col span={4}>
            <Button type="default" block onClick={this.props.onImport}>import</Button>
          </Col>
        </Row>
        <Modal visible={this.state.showModal} footer={null} destroyOnClose onCancel={this.handleCloseEditor}>
          <MissionEditor
            parentNode={this.props.rootMission}
            onSave={this.handleSaveEditor}
            onCancel={this.handleCloseEditor}
          />
        </Modal>
      </>
    )
  }
}

