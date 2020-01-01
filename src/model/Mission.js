import {GuidUtil} from "../utils";

export const NodeType = {
  root: Symbol.for('rootNode')
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

export class MissionFactory{
  /**
   * 添加任务
   * @param parentNode
   * @param mission
   * @returns
   * 返回新的父节点，并将原来此父节点下的所有子节点的父节点指针修改为新的父节点
   */
  static append(parentNode,mission){
    const newParentNode = {...parentNode};
    if(newParentNode.children){
      // 子节点已存在
      newParentNode.children.append(mission);
    }else{
      // 子节点不存在
     newParentNode.children = [mission];
    }
    // 重写父节点指针指向新的父节点
    newParentNode.children.forEach(node=>{
      node.parent = newParentNode;
    });
    return newParentNode;
  }

  /**
   * 修改任务
   * @param parentNode
   * @param mission
   */
  static update(parentNode,mission){

  }

  /**
   * 删除任务
   * @param parentNode
   * @param mission
   */
  static delete(parentNode,mission){

  }

  /**
   * 刷新目标节点
   * @param parentNode
   * @param node
   */
  static refreshNode(parentNode,node){

  }
}