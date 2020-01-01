import React from 'react';
import * as PropTypes from 'prop-types';
import {Row, Col, Typography, List, Button, Modal} from 'antd';
import connectStorage from "./Storage";
import {RootMission} from "../model/Mission";
import MissionEditor from "./MissionEditor";

class TodoList extends React.Component{
  static propTypes = {
    rootMission: PropTypes.objectOf(RootMission).isRequired,
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired
  };

  handleAddButton = () => {
    const modal = Modal.info({
      content: (
        <MissionEditor
          parentNode={this.props.rootMission}
          onSave={(parentNode)=>{
            this.handleRefreshNode(parentNode);
            modal.destroy();
          }}
        />)
    });
  };

  handleRefreshNode = (node) => {
    const rootNode = this.props.rootMission;
    // TODO 更新子节点，返回一个新的根节点
    function refreshNode(parentNode,node){
      return node;
    }
    this.props.onChange(refreshNode(rootNode,node));
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
        <Row type="flex" justify="center">
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
            <Button type="primary" onClick={this.handleAddButton}>add mission</Button>
          </Col>
        </Row>
      </>
    )
  }
}



export default connectStorage(TodoList);