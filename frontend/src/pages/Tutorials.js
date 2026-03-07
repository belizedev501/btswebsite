import React from 'react';
import TutorialSearch from '../components/TutorialsSearch/TutorialSearch';

const Tutorials = () => {
    return (
        <div className='container boxed-container home-area'>
            <div className='row'>
                <div className='col-lg-12'>
                    <TutorialSearch />
                </div>
            </div>
        </div>
    );
};

export default Tutorials;
