import React from "react";
import * as PropTypes from "prop-types";
import {Mission, MissionFactory} from "../model/Mission";
import {Button, Form, Input} from "antd";

const EditType = {
  insert: Symbol.for('insert'),
  update: Symbol.for('update'),
  delete: Symbol.for("delete"),
};
class MissionEditor extends React.Component{

  static propTypes = {
    parentNode: PropTypes.objectOf(Mission).isRequired,
    mission: PropTypes.objectOf(Mission),
    onSave: PropTypes.func.isRequired, // onSave(newParentNode)
  };

  constructor(props) {
    super(props);
    this.mission = this.props.mission || new Mission('');
    this.editType = this.props.mission ? EditType.update : EditType.insert
  }

  handleSubmit = (event) =>{
    event.preventDefault();
    this.props.form.validateFields((errors, values) => {
      console.log(errors,values);
      if(!errors){
        const mission = {...this.mission,...values};
        let targetParentNode;
        const parentNode = this.props.parentNode;
        switch(this.editType) {
          case EditType.update: {
            // update
            targetParentNode = MissionFactory.update(parentNode, mission);
            break;
          }
          case EditType.insert: {
            // insert
            targetParentNode = MissionFactory.append(parentNode, mission);
            break;
          }
        }

        // 返回修改后的parentNode
        this.props.onSave(targetParentNode);
      }
    })
  };

  render() {
    const {getFieldDecorator} = this.props.form;
    let {mission} = this;
    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Item label={"任务ID"}>
          {getFieldDecorator('id',{
            initialValue: mission.id,
          })(<Input readOnly/>)}
        </Form.Item>
        <Form.Item label="任务名称">
          {getFieldDecorator('title',{
            initialValue: mission.title,
            rules: [
              {required: true,message:'请输入任务名称'}
            ]
          })(<Input />)}
        </Form.Item>
        <Form.Item label="任务详情">
          {getFieldDecorator('description',{
            initialValue: mission.description,
            rules: [
              {required: true,message:'请输入任务名称'}
            ]
          })(<Input />)}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>{this.props.mission?'修改':'新增'}</Button>
        </Form.Item>
      </Form>
    )
  }
}
const WrappedMissionEditor = Form.create()(MissionEditor);
WrappedMissionEditor.propTypes = MissionEditor.propTypes;

export default WrappedMissionEditor;
