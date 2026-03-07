import React from 'react';
import GuideSearch from '../components/GuideSearch/GuideSearch';

const Guides = () => {
    return (
        <div className='container boxed-container home-area'>
            <div className='row'>
                <div className='col-lg-12'>
                    <GuideSearch />
                </div>
            </div>
        </div>
    );
};

export default Guides;
