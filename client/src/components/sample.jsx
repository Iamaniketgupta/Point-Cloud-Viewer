import React from 'react';
import styled from "styled-components";


const Wrapper = styled.div`
  background-color: black;
  display: flex;
  flex-direction: column;
  height: 675px;
  width:100vw;
  position: relative;
`;

// import vanillaJS Potree libs, /!\ would be best with proper ES6 import
const Potree = window.Potree
console.log(Potree)
export default class PointcloudNavigator extends React.Component {
    constructor(props) {
        console.dir(props,"ho")
        super(props)
        this.potreeContainerDiv = React.createRef();
    }


    render() {
        return (
            <div id="potree-root">
                <Wrapper ref={this.potreeContainerDiv} className={"potree_container "}>
                    <div id="potree_render_area"></div>
                </Wrapper>

            </div>
        )
    }

    componentDidMount() {

        // initialize Potree viewer
        const viewerElem = this.potreeContainerDiv.current

        const viewer = new Potree.Viewer(viewerElem);

        viewer.setEDLEnabled(true);
        viewer.setFOV(60);
        viewer.setPointBudget(1 * 1000 * 1000);
        viewer.setClipTask(Potree.ClipTask.SHOW_INSIDE);
        viewer.loadSettingsFromURL();

        viewer.setControls(viewer.orbitControls)

        console.log({ viewer })

        viewer.loadGUI(() => {
            viewer.setLanguage('en');
            document.getElementById("menu_appearance").next().show();
            viewer.toggleSidebar();
        });

        // Load and add point cloud to scene
        let url = this.props.url
        console.log(this.props)
        console.log(this.props)
        Potree.loadPointCloud(url).then(e => {
            //let scene = viewer.scene;
            let pointcloud = e.pointcloud;
            let material = pointcloud.material;

            material.activeAttributeName = "rgba";
            material.minSize = 2;
            material.pointSizeType = Potree.PointSizeType.FIXED

            viewer.scene.addPointCloud(pointcloud);

            viewer.fitToScreen();

            console.log("This is the url", url);
        }, e => console.err("ERROR: ", e));

    }


}



