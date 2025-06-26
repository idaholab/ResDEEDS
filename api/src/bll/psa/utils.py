import logging

import xmltodict

logger = logging.getLogger(__name__)


def diagram_to_dict(diagram_data: str) -> dict:
    """
    Converts the diagram data from XML to a dictionary.

    Args:
        diagram_data (str): The XML string representing the diagram.

    Returns:
        dict: The parsed dictionary representation of the diagram.
    """
    try:
        return xmltodict.parse(diagram_data)
    except Exception as e:
        logger.error(f"Error parsing diagram data: {e}")
    return {}
