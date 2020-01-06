import {GuidUtil} from "../utils";

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
 * @param {array<Mission>} children 子任务
 */
export class Mission{
  id = '';
  title = '';
  description = '';
  completed = false;
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
   * 添加任务
   * @param parentNode
   * @param mission
   * @returns
   * 返回新的父节点，并将原来此父节点下的所有子节点的父节点指针修改为新的父节点
   */
  static append(parentNode,mission){
    const targetParentNode = {...parentNode};
    if(targetParentNode.children){
      // 子节点已存在
      targetParentNode.children.push(mission);
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
    const targetParentNode = parentNode.children.map(node=>{
      if(node.id === mission.id){
        return mission;
      }else{
        return node;
      }
    });

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
    const targetParentNode = parentNode.children.filter(node=>{
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
      return Mission.refreshNode(parentNode,tempNode);
    }
  }
}
