import {GuidUtil, Util} from "../utils";

export const NodeType = {
  root: Symbol.for('rootNode'),
  normal: Symbol.for('normalNode'),
  leaf: Symbol.for('leafNode'),
};

/**
 * 任务
 * @param {string} id
 * @param {string} title 任务名称
 * @param {string} description 任务详细描述
 * @param {bool} completed 任务是否完成
 * @param {bool} expanded 任务是否展开
 * @param {Mission[]} children 子任务
 */
export class Mission{
  id = '';
  title = '';
  description = '';
  completed = false;
  expanded = false;
  children = null;
  parent = null;
  type = NodeType.normal;

  constructor(title) {
    this.id = GuidUtil.uuid(); // guid
    this.title = title;
  }
}

export class RootMission extends Mission{

  type = NodeType.root;

  constructor() {
    super('root node');
    this.children = [];
  }

}


/**
 * 修改子节点的父节点指针为当前父节点
 * @param {Mission} parentNode
 * @returns {Mission}
 */
function redirectParentPointer(parentNode){
  parentNode.children.forEach(node=>{
    node.parent = parentNode;
  });
  return parentNode;
}

/**
 * 任务相关工厂方法
 */
export class MissionFactory{
  /**
   * 复制
   * @param mission
   * @returns {Mission}
   */
  static clone(mission){
    switch(mission.type){
      case NodeType.root:{
        return Object.assign(new RootMission(),mission);
      }
      default:{
        return Object.assign(new Mission(),mission);
      }
    }
  }
  /**
   * 添加任务
   * @param parentNode
   * @param mission
   * @returns
   * 返回新的父节点，并将原来此父节点下的所有子节点的父节点指针修改为新的父节点
   */
  static append(parentNode,mission){

    const targetParentNode = MissionFactory.clone(parentNode);
    if(targetParentNode.children){
      // 子节点已存在
      targetParentNode.children = [...targetParentNode.children,mission];
    }else{
      // 子节点不存在
      targetParentNode.children = [mission];
    }
    // 重写父节点指针指向新的父节点
    redirectParentPointer(targetParentNode);
    return targetParentNode;
  }

  /**
   * 修改任务
   * @param parentNode
   * @param mission
   */
  static update(parentNode,mission){
    // 修改目标节点为修改后的节点
    const targetParentNode = MissionFactory.clone(parentNode);
    targetParentNode.children = parentNode.children.map(node=>{
      if(node.id === mission.id){
        return mission;
      }else{
        return node;
      }
    });

    // 如果子节点还有子节点，则更新子节点的父节点指针指向新生成的子节点
    if(!Util.isEmpty(mission.children)){
      mission.children.forEach(item=>{
        item.parent = mission;
      })
    }

    // 重写父节点指针指向新的父节点
    redirectParentPointer(targetParentNode);
    return targetParentNode;
  }

  /**
   * 删除任务
   * @param parentNode
   * @param mission
   */
  static delete(parentNode,mission){
    const targetParentNode = MissionFactory.clone(parentNode);
    targetParentNode.children = parentNode.children.filter(node=>{
      return node.id !== mission.id;
    });

    // 重写父节点指针指向新的父节点
    redirectParentPointer(targetParentNode);
    return targetParentNode;
  }

  /**
   * 刷新目标节点
   * @param {Mission} parentNode
   * @param {Mission} node
   */
  static refreshNode(parentNode,node){
    let pointer = node;
    while(true){
      const tempParentNode = pointer.parent;
      if(tempParentNode === parentNode){
        break;
      }

      if(tempParentNode.type === NodeType.root){
        throw new Error('无效的父节点');
      }

      pointer = tempParentNode;
    }


    if(node.parent === parentNode){
      return MissionFactory.update(node.parent,node);
    }else{
      const tempNode = MissionFactory.update(node.parent,node);
      return MissionFactory.refreshNode(parentNode,tempNode);
    }
  }

  /**
   * 转为json
   * @param mission
   * @returns {string}
   */
  static convertToJson(mission) {
    const data = convertMissionToData(mission);
    return JSON.stringify(data);
  }

  /**
   * 从json创建Mission
   * @param json
   * @returns {Mission}
   */
  static createFromJson(json){
    const data = JSON.parse(json);
    const mission = convertDataToMission(data);
    return mission;
  }

  /**
   * 解析附加信息
   * @param {Mission} mission
   * @returns
   * {
   *   completedKeys: [], // 完成的任务ID
   *   expandedKeys: [], // 展开的任务ID
   * }
   */
  static parseExtraInfo(mission) {
    const extraInfo = {
      completedKeys: new Set(),
      expandedKeys: new Set(),
    };
    if(mission.completed){
      extraInfo.completedKeys.add(mission.id);
    }
    if(mission.expanded){
      extraInfo.expandedKeys.add(mission.id);
    }
    if(!Util.isEmpty(mission.children)){
      mission.children.forEach(mission=>{
        const {completedKeys,expandedKeys} = MissionFactory.parseExtraInfo(mission);
        [...completedKeys].forEach(key=>{
          extraInfo.completedKeys.add(key);
        });
        [...expandedKeys].forEach(key=>{
          extraInfo.expandedKeys.add(key);
        });
      })
    }
    return extraInfo;
  }
}

/**
 * 将Mission转为纯数据对象
 * @param mission
 * @returns {object}
 */
function convertMissionToData(mission){
  // 常规字段赋值
  const {parent,children,type,...data} = mission;

  // type赋值
  data.type = Symbol.keyFor(type);

  // children赋值
  if(children){
    data.children = children.map(item=>{
      return convertMissionToData(item);
    })
  }else{
    data.children = null;
  }

  return data;
}

/**
 * 将纯数据对象转为Mission
 * @param data
 * @param {Mission} [parent=null] 父节点，默认为空
 * @returns {Mission}
 */
function convertDataToMission(data,parent=null){
  // 常规赋值
  const {type,children,...missionData} = data;

  let mission;
  switch(Symbol.for(type)){
    case NodeType.root: {
      mission = new RootMission();
      break;
    }
    default:{
      mission = new Mission();
    }
  }
  Object.assign(mission,missionData);

  // type赋值
  mission.type = Symbol.for(type);

  // children赋值
  if(children){
    mission.children = children.map(item=>{
      return convertDataToMission(item,mission);
    })
  }else{
    mission.children = null;
  }

  // parent赋值
  mission.parent = parent;

  return mission;
}
