/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
import throttle from 'lodash/throttle';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import viewport from 'lib/viewport';

class StickyPanel extends Component {
	static propTypes = {
		adjustHeight: PropTypes.number,
		offsetTop: PropTypes.number,
		checkForHeaderMasterbar: PropTypes.bool,
		className: PropTypes.string,
	};

	static defaultProps = {
		adjustHeight: 0,
		checkForHeaderMasterbar: true,
		offsetTop: 8,
	}

	state = { isSticky: false };

	constructor() {
		super( ...arguments );

		// bound
		this.onWindowResize = this.onWindowResize.bind( this );
		this.onWindowScroll = this.onWindowScroll.bind( this );
		this.updateIsSticky = this.updateIsSticky.bind( this );

		// window events
		this.throttleOnResize = throttle( this.onWindowResize, 200 );
		window.addEventListener( 'scroll', this.onWindowScroll );
		window.addEventListener( 'resize', this.throttleOnResize );
	}

	componentDidMount() {
		if ( viewport.isMobile() ) {
			return null;
		}

		this.domElement = ReactDom.findDOMNode( this );
		this.elementDimms = this.domElement.getBoundingClientRect();
		this.elementHeight = this.elementDimms.height + this.props.adjustHeight;
		this.threshold = 0;
		this.stickAt = 0;

		this.threshold += this.elementDimms.top - this.props.offsetTop;

		// verify if the <Header /> masterbar is into DOMTree
		// and adjust if it's true
		if ( this.props.checkForHeaderMasterbar ) {
			const headerElement = document.getElementById( 'header' );
			this.stickAt = headerElement ? headerElement.getBoundingClientRect().height : 0;
			this.threshold -= this.stickAt;
		}

		this.updateIsSticky();
	}

	componentWillUnmount() {
		window.removeEventListener( 'scroll', this.onWindowScroll );
		window.removeEventListener( 'resize', this.throttleOnResize );
		window.cancelAnimationFrame( this.rafHandle );
	}

	onWindowScroll() {
		this.elementDimms = this.domElement.getBoundingClientRect();
		this.rafHandle = window.requestAnimationFrame( this.updateIsSticky );
	}

	onWindowResize() {
		this.elementDimms = this.domElement.getBoundingClientRect();
	}

	updateIsSticky() {
		if ( viewport.isMobile() ) {
			return this.setState( { isSticky: false } );
		}

		const isSticky = window.pageYOffset > this.threshold;
		this.setState( { isSticky } );
	}

	getBlockStyle() {
		if ( ! this.state.isSticky ) {
			return null;
		}

		const top = this.stickAt + this.props.offsetTop;
		const { width } = this.elementDimms;

		return { top, width };
	}

	getSpacerHeight() {
		return this.state.isSticky ? this.elementHeight : 0;
	}

	render() {
		const classes = classNames(
			'sticky-panel',
			this.props.className,
			{ 'is-sticky': this.state.isSticky }
		);

		return (
			<div className={ classes }>
				<div className="sticky-panel__content" style={ this.getBlockStyle() }>
					{ this.props.children }
				</div>
				<div className="sticky-panel__spacer" style={ { height: this.getSpacerHeight() } } />
			</div>
		);
	}
}

export default StickyPanel;

