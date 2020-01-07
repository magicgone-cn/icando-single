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
      const jsonStr = MissionFactory.convertToJson(this.state.rootMission);
      localStorage.setItem("rootMission",jsonStr);
      return Promise.resolve(jsonStr);
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

    handleExport = () => {
      // 先保存
      this.handleSave().then((jsonStr)=>{
        const filename = 'icando.json';
        const blob = new Blob([jsonStr],{type:'text/json'});
        const a = document.createElement('a');
        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
        a.click();
      });
    };

    handleImport = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.addEventListener('change',(event)=>{
        const file = event.path[0].files.item(0);
        const fileReader = new FileReader();
        fileReader.onload = (event)=>{
          const jsonStr = event.target.result;
          const rootMission = MissionFactory.createFromJson(jsonStr);
          this.setState({
            rootMission
          });
        };
        fileReader.readAsText(file);
      });
      input.click();
    };

    render() {
      const {rootMission} = this.state;
      return <WrapperComponent
        {...this.props}
        rootMission={rootMission}
        onChange={this.handleChange}
        onSave={this.handleSave}
        onExport={this.handleExport}
        onImport={this.handleImport}
      />
    }
  }
}
