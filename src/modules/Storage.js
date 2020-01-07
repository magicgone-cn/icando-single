import React from 'react';
import {MissionFactory, RootMission} from "../model/Mission";

export default function connectStorage(WrapperComponent){
  return class Storage extends React.Component{

    state = {
      rootMission: new RootMission()
    };

    componentDidMount() {
      this.handleLoad();
    }

    handleChange = (rootMission) => {
      this.setState({
        rootMission: rootMission
      })
    };

    handleSave = () => {
      localStorage.setItem("rootMission",MissionFactory.convertToJson(this.state.rootMission));
      return Promise.resolve();
    };

    handleLoad = () => {
      const rootMissionStr = localStorage.getItem("rootMission");
      if(rootMissionStr){
        const rootMission = MissionFactory.createFromJson(rootMissionStr);
        this.setState({
          rootMission
        })
      }
    };

    render() {
      const {rootMission} = this.state;
      return <WrapperComponent {...this.props} rootMission={rootMission} onChange={this.handleChange} onSave={this.handleSave}/>
    }
  }
}
