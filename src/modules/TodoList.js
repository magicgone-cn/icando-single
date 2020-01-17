import React from 'react';
import * as PropTypes from 'prop-types';
import {Row, Col, Typography, List, Button, Modal, Tree, Checkbox, Switch} from 'antd';
import {MissionFactory, NodeType, RootMission} from "../model/Mission";
import MissionEditor from "./MissionEditor";

import './TodoList.css';
import {ArrayUtil, Util} from "../utils";

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

  handleCompletedChange = (checkedKeys,event) => {
    const checked = event.checked;
    const mission = event.node.props['data-mission'];
    this.refreshNode(Object.assign(MissionFactory.clone(mission),{completed:checked}));
  };

  /**
   * 渲染树节点
   * @param {Mission[]} nodes
   * @returns {*}
   */
  renderTreeNodes = (nodes) => {
    const {showCompleted} = this.state;
    if(nodes){
      return nodes.map( mission => {
        return (
          <Tree.TreeNode
            className="treeNode"
            style={!showCompleted&&mission.completed?{display:'none'}:{}}
            key={mission.id}
            data-mission={mission}
            title={(
              <ol>
                <List.Item className="mission" actions={[<Button className="btn-hidden" onClick={()=>{this.handleEdit(mission)}}>编辑</Button>,<Button className="btn-hidden" onClick={()=>{this.handleDelete(mission)}}>删除</Button>,<Button className="btn-hidden" onClick={()=>{this.handleAdd(mission)}}>添加</Button>]}>
                  <List.Item.Meta title={mission.title} description={mission.description} />
                </List.Item>
              </ol>
            )}
          >
            {!Util.isEmpty(mission.children) && this.renderTreeNodes(mission.children)}
          </Tree.TreeNode>
        )
      });
    }
  };

  /**
   * 渲染列表节点
   * @param {Mission} mission
   * @returns {*}
   */
  renderMission = (mission) => {
    const {showCompleted} = this.state;
    // TODO button传递mission存在效率问题，待优化
    return (
      <>
        <List.Item hidden={!showCompleted&&mission.completed} className="mission" actions={[<Button className="btn-hidden" onClick={()=>{this.handleEdit(mission)}}>编辑</Button>,<Button className="btn-hidden" onClick={()=>{this.handleDelete(mission)}}>删除</Button>,<Button className="btn-hidden" onClick={()=>{this.handleAdd(mission)}}>添加</Button>]}>
          <Checkbox checked={mission.completed} onChange={this.handleCompletedChange} data-mission={mission} style={{marginRight: '20px'}}/>
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

  handleDrop = ({node,dragNode,dropPosition}) => {
    // 命名规则 drop为拖拽终点，drag为拖拽目标

    // 拖拽终点目标节点
    const dropTargetNode = node;
    // 拖拽终点目标节点的位置
    const dropTargetPosition = parseInt(ArrayUtil.getLast(node.props.pos.split('-')));
    // 拖拽终点相对目标节点的位置 -1 节点前 0 节点中 1 节点后
    const relativePosition = dropPosition - dropTargetPosition;
    // 拖拽终点任务节点
    let dropTargetMission = dropTargetNode.props['data-mission'];
    const dragMission = dragNode.props['data-mission'];

    console.log(dropTargetMission,dropTargetPosition,dragMission,relativePosition);

    let rootMission = this.props.rootMission;

    // step1 从原节点处删除拖拽节点
    const newDeletedNode = MissionFactory.delete(dragMission.parent,dragMission);
    rootMission = MissionFactory.refreshNode(rootMission,newDeletedNode);

    // 删除拖拽节点后，会生成新的节点链，如果目标节点在新生成的节点链上，则后续插入操作需要在新的节点链上操作
    let pointer = newDeletedNode;
    while(true){
      if(pointer.id === dropTargetMission.id){
        dropTargetMission = pointer;
        break;
      }

      if(pointer.type === NodeType.root){
        break;
      }

      pointer = pointer.parent;
    }

    // step2 将拖拽节点复制到终点处
    if(relativePosition === 0){
      rootMission = MissionFactory.refreshNode(rootMission,MissionFactory.append(dropTargetMission,dragMission));
    }else{
      const dropTargetIndex = dropTargetMission.parent.children.indexOf(dropTargetMission);
      const dropIndex = relativePosition===-1?dropTargetIndex:dropTargetIndex+1;
      rootMission = MissionFactory.refreshNode(rootMission,MissionFactory.insert(dropTargetMission.parent,dragMission,dropIndex));
    }
    this.refreshNode(rootMission);

  };

  render() {
    const missionList = this.props.rootMission.children;
    const {completedKeys,expandedKeys} = MissionFactory.parseExtraInfo(this.props.rootMission);
    return (
      <>
        <Row type="flex" justify="center">
          <Col style={{textAlign:'center'}}>
            <Typography.Title>I CAN DO</Typography.Title>
            <Switch checkedChildren="显示已完成" unCheckedChildren="隐藏已完成" checked={this.state.showCompleted} onChange={this.handleShowCompletedChange}/>
          </Col>
        </Row>
        <Row type="flex" justify="space-around" style={{minHeight: '50vh'}}>
          <Col span={16}>
            <Tree
              blockNode
              checkStrictly
              checkable
              checkedKeys={[...completedKeys]}
              onCheck={this.handleCompletedChange}
              draggable
              onDrop={this.handleDrop}
            >
              {this.renderTreeNodes(missionList)}
            </Tree>
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

