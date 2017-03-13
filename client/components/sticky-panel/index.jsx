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
		checkForHeadermasterbar: PropTypes.bool,
		className: PropTypes.string,
	};

	static defaultProps = {
		checkForHeadermasterbar: true,
	}

	state = {
		isSticky: false,
		spacerHeight: 0,
		blockWidth: 0,
	};

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
		this.domElement = ReactDom.findDOMNode( this );
		this.dimms = this.domElement.getBoundingClientRect();
		this.threshold = 0;

		this.threshold += this.dimms.top;

		// verify if the Header masterbar is into DOMTree
		if ( this.props.checkForHeadermasterbar ) {
			const headerElement = document.getElementById( 'header' );
			this.threshold -= headerElement ? headerElement.getBoundingClientRect().height : 0;
		}

		this.updateIsSticky();
	}

	componentWillUnmount() {
		window.removeEventListener( 'scroll', this.onWindowScroll );
		window.removeEventListener( 'resize', this.throttleOnResize );
		window.cancelAnimationFrame( this.rafHandle );
	}

	onWindowScroll() {
		this.dimms = this.domElement.getBoundingClientRect();
		this.rafHandle = window.requestAnimationFrame( this.updateIsSticky );
	}

	onWindowResize() {
		this.dimms = this.domElement.getBoundingClientRect();
		this.setState( {
			spacerHeight: this.state.isSticky ? this.dimms.height : 0,
			blockWidth: this.state.isSticky ? this.dimms.width : 0
		} );
	}

	updateIsSticky() {
		const isSticky = window.pageYOffset > this.threshold;

		if ( viewport.isMobile() ) {
			return this.setState( { isSticky: false } );
		}

		if ( isSticky !== this.state.isSticky ) {
			this.setState( {
				isSticky: isSticky,
				spacerHeight: isSticky ? this.dimms.height : 0,
				blockWidth: isSticky ? this.dimms.width : 0,
			} );
		}
	}

	getBlockStyle() {
		if ( this.state.isSticky ) {
			// Offset to account for Master Bar by finding body visual top
			// relative the current scroll position
			const offset = document.getElementById( 'header' ).getBoundingClientRect().height;

			return {
				top: offset,
				width: this.state.blockWidth,
			};
		}
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
				<div className="sticky-panel__spacer" style={ { height: this.state.spacerHeight } } />
			</div>
		);
	}
}

export default StickyPanel;

