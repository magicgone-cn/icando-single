import React from 'react';
import * as PropTypes from 'prop-types';
import {Row, Col, Typography, List, Button, Modal, Tree, Checkbox, Switch} from 'antd';
import {MissionFactory, NodeType, RootMission} from "../model/Mission";
import MissionEditor from "./MissionEditor";

import './TodoList.css';

export default class TodoList extends React.Component{
  static propTypes = {
    rootMission: PropTypes.instanceOf(RootMission).isRequired,
    onChange: PropTypes.func.isRequired, // 数据变化
    onSave: PropTypes.func.isRequired, // 保存
    onImport: PropTypes.func.isRequired, // 导入
    onExport: PropTypes.func.isRequired, // 导出
  };

  state = {
    showCompleted: false
  };

  openEditor = (mission) => {
    const promise = new Promise((resolve)=>{
      const modal = Modal.info({
        icon: null,
        okButtonProps: {style:{display: 'none'}},
        content: (
          <MissionEditor
            mission={mission}
            onChange={(mission)=>{resolve(mission);modal.destroy();}}
            onCancel={()=>{modal.destroy()}}
          />
        )
      });
    });
    const editor = {
      onChange: (callback) => {
        promise.then((mission)=>{
          callback(mission);
        })
      }
    };
    return editor;
  };

  refreshNode = (node) => {
    const rootNode = this.props.rootMission;
    if(node.type === NodeType.root){
      this.props.onChange(node);
    }else{
      this.props.onChange(MissionFactory.refreshNode(rootNode,node));
    }

  };

  renderTreeNodes = (nodes) => {
    if(nodes){
      return nodes.map( mission => {
        return (
          <Tree.TreeNode title={mission.title} key={mission.key}>
            {mission.children && this.renderTreeNodes(mission.children)}
          </Tree.TreeNode>
        )
      });
    }
  };

  handleMissionStatusChange = (event) => {
    const checked = event.target.checked;
    const mission = event.target['data-mission'];
    this.refreshNode(Object.assign(MissionFactory.clone(mission),{completed:checked}));
  };

  /**
   *
   * @param {Mission} mission
   * @returns {*}
   */
  renderMission = (mission) => {
    const {showCompleted} = this.state;
    // TODO button传递mission存在效率问题，待优化
    return (
      <>
        <List.Item hidden={!showCompleted&&mission.completed} className="mission" actions={[<Button className="btn-hidden" onClick={()=>{this.handleEdit(mission)}}>编辑</Button>,<Button className="btn-hidden" onClick={()=>{this.handleDelete(mission)}}>删除</Button>,<Button className="btn-hidden" onClick={()=>{this.handleAdd(mission)}}>添加</Button>]}>
          <Checkbox checked={mission.completed} onChange={this.handleMissionStatusChange} data-mission={mission} style={{marginRight: '20px'}}/>
          <List.Item.Meta title={mission.title} description={mission.description} />
        </List.Item>
        {mission.children && Object.keys(mission.children).length > 0 && <List style={{marginLeft: '20px'}} dataSource={mission.children} rowKey={(mission)=>mission.id} renderItem={(mission)=>{
          return this.renderMission(mission);
        }} />}
      </>
    )
  };

  /**
   * 编辑Mission
   * @param mission
   */
  handleEdit = (mission) => {
    this.openEditor(mission).onChange((mission)=>{
      this.refreshNode(mission);
    })
  };

  /**
   * 删除mission
   * @param mission
   */
  handleDelete = (mission) => {
    this.refreshNode(MissionFactory.delete(mission.parent,mission));
  };

  /**
   * 添加子mission
   * @param {Mission} parentMission
   */
  handleAdd = (parentMission) => {
    this.openEditor().onChange((mission)=>{
      this.refreshNode(MissionFactory.append(parentMission,mission));
    });
  };

  handleShowCompletedChange = (showCompleted) => {
    this.setState({showCompleted});
  };

  render() {
    const missionList = this.props.rootMission.children;
    return (
      <>
        <Row type="flex" justify="center">
          <Col style={{textAlign:'center'}}>
            <Typography.Title>I CAN DO</Typography.Title>
            <Switch checkedChildren="显示已完成" unCheckedChildren="隐藏已完成" checked={this.state.showCompleted} onChange={this.handleShowCompletedChange}/>
          </Col>
        </Row>
        <Row type="flex" justify="center" style={{minHeight: '50vh'}}>
          <Col span={18}>
            <List dataSource={missionList} rowKey={(mission)=>mission.id} renderItem={(mission)=>{
              return this.renderMission(mission);
            }} />
          </Col>
          <Col span={10}>
            <Button type="primary" block onClick={()=>{this.handleAdd(this.props.rootMission)}}>add mission</Button>
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
      </>
    )
  }
}

