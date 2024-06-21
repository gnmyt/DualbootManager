import {useLocation, useOutlet} from "react-router-dom";
import {ConfigurationProvider} from "@common/contexts/ConfigurationContext";
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import {routes} from "../../main";

export default () => {
    const location = useLocation();
    const currentOutlet = useOutlet();

    const route = routes.find(route => route.path === location.pathname);
    const nodeRef = route?.nodeRef;

    return (
        <div className="root">
            <ConfigurationProvider/>
            <div className="blur"></div>
            <SwitchTransition>
                <CSSTransition
                    key={location.pathname}
                    nodeRef={nodeRef}
                    timeout={500}
                    classNames="page"
                    unmountOnExit
                >
                    {(state) => (
                        <div ref={nodeRef} className="page">
                            {currentOutlet}
                        </div>
                    )}
                </CSSTransition>
            </SwitchTransition>
        </div>
    );
}