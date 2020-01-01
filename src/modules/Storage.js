import React from 'react';
import {RootMission} from "../model/Mission";

export default function connectStorage(WrapperComponent){
  return class Storage extends React.Component{

    state = {
      rootMission: new RootMission()
    };

    handleChange = (rootMission) => {
      this.setState({
        rootMission: rootMission
      })
    };

    handleSave = () => {
      sessionStorage.setItem("rootMission",JSON.stringify(this.state.rootMission));
    };

    handleLoad = () => {
      const rootMission = sessionStorage.getItem("rootMission");
      if(rootMission != null){
        this.setState({
          rootMission
        })
      }
    };

    render() {
      const {rootMission} = this.state;
      return <WrapperComponent {...this.props} rootMission={rootMission} onChange={this.handleChange}/>
    }
  }
}