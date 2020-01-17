import React from "react";
import * as PropTypes from "prop-types";
import {Mission} from "../model/Mission";
import {Button, Form, Input} from "antd";

const EditType = {
  insert: Symbol.for('insert'),
  update: Symbol.for('update'),
  delete: Symbol.for("delete"),
};
class MissionEditor extends React.Component{

  static propTypes = {
    mission: PropTypes.instanceOf(Mission),
    onChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.mission = this.props.mission || new Mission('');
    this.editType = this.props.mission ? EditType.update : EditType.insert
  }

  handleSubmit = (event) =>{
    event.preventDefault();
    this.props.form.validateFields((errors, values) => {
      if(!errors){
        const mission = {...this.mission,...values};

        // 返回修改后的mission
        this.props.onChange(mission);
      }
    })
  };

  render() {
    const {getFieldDecorator} = this.props.form;
    let {mission} = this;
    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Item label={"任务ID"} hidden>
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
            initialValue: mission.description
          })(<Input />)}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>{formatButtonText(this.editType)}</Button>
          <Button type="default" block onClick={this.props.onCancel}>取消</Button>
        </Form.Item>
      </Form>
    )
  }
}

/**
 * 格式化按钮文字
 * @param editType
 */
function formatButtonText(editType){
  switch(editType){
    case EditType.update:{
      return '修改';
    }
    case EditType.insert:{
      return '新增';
    }
    default: {
      return '保存';
    }
  }
}

const WrappedMissionEditor = Form.create()(MissionEditor);
WrappedMissionEditor.propTypes = MissionEditor.propTypes;

export default WrappedMissionEditor;
