# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class AladinLiteReactComponent(Component):
    """An AladinLiteReactComponent component.


Keyword arguments:

- id (string; optional):
    The ID used to identify this component in Dash callbacks.

- clickedCoordinates (dict; optional)

    `clickedCoordinates` is a dict with keys:

    - dec (number; required)

    - ra (number; required)

- doubleClickedCoordinates (dict; optional)

    `doubleClickedCoordinates` is a dict with keys:

    - dec (number; required)

    - ra (number; required)

- fov (number; default 2):
    The FOV of the display.

- height (number; default 500):
    Aladin window height.

- selectedStar (dict; optional)

    `selectedStar` is a dict with keys:

    - dec (number; optional)

    - name (string; optional)

    - ra (number; optional)

- stars (list of dicts; optional):
    list of Marked objects.

    `stars` is a list of dicts with keys:

    - dec (number; required)

    - name (string; optional)

    - ra (number; required)

- target (string; default '03 47 00.00 +24 07 00.0'):
    The target to display.

- width (number; default 500):
    Aladin window width."""
    _children_props = []
    _base_nodes = ['children']
    _namespace = 'aladin_lite_react_component'
    _type = 'AladinLiteReactComponent'
    @_explicitize_args
    def __init__(self, id=Component.UNDEFINED, width=Component.UNDEFINED, height=Component.UNDEFINED, target=Component.UNDEFINED, fov=Component.UNDEFINED, stars=Component.UNDEFINED, selectedStar=Component.UNDEFINED, clickedCoordinates=Component.UNDEFINED, doubleClickedCoordinates=Component.UNDEFINED, **kwargs):
        self._prop_names = ['id', 'clickedCoordinates', 'doubleClickedCoordinates', 'fov', 'height', 'selectedStar', 'stars', 'target', 'width']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'clickedCoordinates', 'doubleClickedCoordinates', 'fov', 'height', 'selectedStar', 'stars', 'target', 'width']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args}

        super(AladinLiteReactComponent, self).__init__(**args)
