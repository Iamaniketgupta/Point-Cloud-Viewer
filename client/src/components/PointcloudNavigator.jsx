import { useEffect, useRef } from 'react';
import styled from "styled-components";

const Wrapper = styled.div`
  background-color: black;
  height: 100%;
  width:100% ;
  position: absolute;
`;

const Potree = window.Potree;
console.log(Potree)
const PointcloudNavigator = ({ url }) => {
    const potreeContainerDiv = useRef(null);
    let viewer = useRef(null);

    useEffect(() => {
        const initializeViewer = (url) => {
            if (!viewer.current) {
                const viewerElem = potreeContainerDiv.current;
                viewer.current = new Potree.Viewer(viewerElem);

                viewer.current.setEDLEnabled(true);
                viewer.current.setFOV(60);
                viewer.current.setPointBudget(1* 1000 * 1000);
                viewer.current.setClipTask(Potree.ClipTask.SHOW_INSIDE);
                viewer.current.loadSettingsFromURL();
                // viewer.current.setBackground(null);


                viewer.current.setControls(viewer.current.orbitControls);

                viewer.current.scene.view.setView(
                    [2652381.103, 549049.447, 411.636],
                    [2652364.407, 549077.205, 199.696],
                );

                
                viewer.current.loadGUI(() => {
                    viewer.current.setLanguage('en');
                    document.getElementById("menu_appearance").next().show();
                    viewer.current.toggleSidebar();
                });
            }

            Potree.loadPointCloud( url ).then(e => {
                const pointcloud = e.pointcloud;
                const material = pointcloud.material;

                material.activeAttributeName = "rgba";
                material.minSize = 2;
                // material.size = 0.5;

                material.pointSizeType = Potree.PointSizeType.FIXED;

                viewer.current.scene.addPointCloud(pointcloud);
              
                viewer.current.fitToScreen();

                viewer.current.scene.view.position.set(689429.64, 3877023.77, 42878.97);

                
             
                console.log("Loaded point cloud from URL:", url);
            }).catch(e => console.error("ERROR loading point cloud:", e));
        };




        initializeViewer(url);

        // return () => {
        //     if (viewer.current) {
        //         viewer.current.scene.pointclouds.forEach(pc => viewer.current.scene?.removePointCloud(pc));
        //         viewer.current = null;
        //     }
        // };
    }, [url]);

    return (
        <div id="potree-root">
            <Wrapper ref={potreeContainerDiv} className="potree_container h-full relative flex-grow">
                <div className='p-3 absolute z-50 bottom-4 right-4 text-gray-300'>
                    Tap Any where on the object to zoom
                </div>
                <div id="potree_render_area">
        
                </div>

            </Wrapper>
        </div>
    );
};

export default PointcloudNavigator;
